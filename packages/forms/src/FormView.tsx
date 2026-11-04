import { CircleCheck } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

import {
    type Form,
    type SubmitResult,
    getLayoutFieldNames,
    getProblem,
    resolveFields,
    selectVisible,
    useLeaveGuard,
    usePanneau,
    usePlugins,
} from '@panneau/core';
import {
    type FieldCheckSource,
    type FieldEntry,
    FieldsProvider,
    type RelationSource,
    type UploadSource,
    builtInFields,
} from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import { Alert, Button, Icon, usePanneauIntl, useToast, useToastOffset } from '@panneau/ui';

import { ConflictDialog } from './ConflictDialog';
import { ErrorSummary } from './ErrorSummary';
import styles from './Form.module.css';
import { FormBinding } from './FormBinding';
import { FormSkeleton } from './FormSkeleton';
import { FormContext, RevealContext, createRevealRegistry, useFormState } from './context';
import { cx } from './cx';
import { FieldFlow, LayoutNodes } from './layout/Layout';
import { messages } from './messages';
import { useBeforeUnloadGuard, useLeaveConfirmation } from './unsaved';

export interface FormViewProps {
    /** The form state, from `useForm()` or `createForm()` of `@panneau/core`. */
    form: Form;
    /** The fields of the form. */
    fields: readonly Field[];
    /** The layout tree. Fields that no node references are added at the end. */
    layout?: readonly LayoutNode[];
    /** Locales of localized fields. Defaults to the definition's, from `PanneauProvider`. */
    locales?: readonly string[];
    /** Where relation fields search. Defaults to the one of a parent `FieldsProvider`. */
    relationSource?: RelationSource | null;
    /**
     * Where fields that take files upload them directly to storage. Defaults to the one of a
     * parent `FieldsProvider`. Without one, values hold the files themselves.
     */
    uploadSource?: UploadSource | null;
    /**
     * Where fields with `check` check their value, such as a slug's availability:
     * `createFieldCheckSource(adapter, resource, id)`. Defaults to the one of a parent
     * `FieldsProvider`.
     */
    checkSource?: FieldCheckSource | null;
    /** Field entries by type, over the built-in ones and those of the plugins. */
    components?: Readonly<Record<string, FieldEntry>>;
    /** Label of the submit button. Defaults to "Save". `null` hides the button. */
    submitLabel?: ReactNode;
    /** Other buttons, next to the submit button. */
    actions?: ReactNode;
    /** Called after a successful submit, with what `onSubmit` returned. */
    onSubmitted?: (result: unknown) => void;
    /**
     * Called by "Load the current version" in the conflict dialog when the backend didn't send the
     * current item: fetch it, and `form.reset()` with it.
     */
    onReload?: () => void;
    /**
     * Asks for confirmation before the page is left with unsaved changes: closed or reloaded, or,
     * under a `LeaveGuardsProvider`, left through the app's router. Defaults to true.
     */
    guardUnsavedChanges?: boolean;
    /**
     * Shows "Saved" in a toast after a successful submit, when the form has no footer to say it
     * (no submit button and no `actions`). Defaults to true. A form with a footer says "Saved" in
     * it, next to its button, where "Unsaved changes" was: the page already shows it (decision
     * 0062).
     */
    showSavedToast?: boolean;
    /**
     * The item was saved just before the form started over from it (a new `key` after a save):
     * the footer says "Saved" until the values change.
     */
    saved?: boolean;
    /**
     * The values load, such as the item to edit: the form draws a skeleton of its layout and
     * fields instead (decision 0034).
     */
    isLoading?: boolean;
    id?: string;
    'aria-label'?: string;
    className?: string;
    layoutClassName?: string;
    sidebarClassName?: string;
    footerClassName?: string;
    summaryClassName?: string;
}

const FOCUSABLE =
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The element of the field at a path, or of the closest field that holds it. */
function findFieldElement(root: HTMLElement, path: string): HTMLElement | null {
    let current = path;
    while (current !== '') {
        const element = root.querySelector<HTMLElement>(
            `[data-panneau-path="${CSS.escape(current)}"]`,
        );
        if (element !== null) {
            return element;
        }
        current = current.includes('.') ? current.slice(0, current.lastIndexOf('.')) : '';
    }
    return null;
}

/**
 * Error paths in the order of their fields: the order of the layout for top-level fields, then
 * the order of the paths inside them: locales in their order (`title.fr` before `title.en`), and
 * items by number (`blocks.2.body` before `blocks.10.body`).
 */
function orderErrors(
    names: readonly string[],
    errors: Record<string, string[]>,
    locales: readonly string[] = [],
): Record<string, string[]> {
    const rank = (path: string) => {
        const index = names.indexOf(path.split('.')[0] ?? '');
        return index === -1 ? names.length : index;
    };
    const localeRank = (path: string) => {
        const index = locales.indexOf(path.split('.')[1] ?? '');
        return index === -1 ? locales.length : index;
    };
    const compare = (a: string, b: string) =>
        rank(a) - rank(b) ||
        localeRank(a) - localeRank(b) ||
        a.localeCompare(b, undefined, { numeric: true });
    return Object.fromEntries(Object.entries(errors).sort(([a], [b]) => compare(a, b)));
}

/** Whether a node is a field that the layout as given doesn't place. */
function isUnplacedField(node: LayoutNode | undefined, placed: ReadonlySet<string>): boolean {
    return node?.type === 'field' && node.name !== undefined && !placed.has(node.name);
}

/**
 * Renders a form: its fields in their layout, bound to the form state of `@panneau/core`, with
 * an error summary, a scroll to the first error, error counts on tabs and sections, a guard for
 * unsaved changes and the dialog of version conflicts. Saving is the job of the form's
 * `onSubmit`.
 */
export function FormView({
    form,
    fields,
    layout = [],
    locales,
    relationSource,
    uploadSource,
    checkSource,
    components,
    submitLabel,
    actions,
    onSubmitted,
    onReload,
    guardUnsavedChanges = true,
    showSavedToast = true,
    saved = false,
    isLoading = false,
    id,
    'aria-label': ariaLabel,
    className,
    layoutClassName,
    sidebarClassName,
    footerClassName,
    summaryClassName,
}: FormViewProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const { definition } = usePanneau();
    const plugins = usePlugins();
    const state = useFormState(form);
    const [registry] = useState(createRevealRegistry);
    const [resolving, setResolving] = useState(false);
    const root = useRef<HTMLFormElement>(null);
    const footer = useRef<HTMLDivElement>(null);
    const hasFooter = submitLabel !== null || actions !== undefined;
    // Toasts rise above the footer, which sticks to the bottom of the page.
    useToastOffset(footer, hasFooter && !isLoading);
    // "Saved" in the footer, from the last submit or from before the form started over, until the
    // values change.
    const [savedShown, setSavedShown] = useState(saved);
    if (savedShown && state.dirty) {
        setSavedShown(false);
    }
    const guarded = guardUnsavedChanges && state.dirty;
    useBeforeUnloadGuard(guarded);
    // Leaving through the app's router asks first, in a dialog
    const leave = useLeaveConfirmation(guarded);
    useLeaveGuard(guarded, leave.confirmLeave);

    // In the mode of the form, as its rules are checked: the required mark of a password
    // required on create shows on create only
    const formLocales = locales ?? definition?.locales ?? [];
    const resolved = resolveFields(fields, layout, { mode: form.mode });
    const main = resolved.layout.filter((node) => node.type !== 'sidebar');
    // The fields that the layout doesn't place come last: they flow in columns
    const placed = new Set(getLayoutFieldNames(layout));
    let split = main.length;
    while (split > 0 && isUnplacedField(main[split - 1], placed)) {
        split -= 1;
    }
    const flow = main.slice(split);
    const laidOut = main.slice(0, split);
    const sidebar = resolved.layout.filter(
        (node) => node.type === 'sidebar' && selectVisible(state, node),
    );
    const order = [
        ...getLayoutFieldNames(main),
        ...getLayoutFieldNames(sidebar.flatMap((node) => node.children ?? [])),
    ];
    const entries: Record<string, FieldEntry> = {
        ...builtInFields,
        ...(Object.fromEntries(plugins.fields) as Record<string, FieldEntry>),
        ...components,
    };

    /** Opens the tab, section or locale of a path, then scrolls to its field and focuses it. */
    const goTo = (path: string) => {
        registry.reveal(path);
        // Wait for the tab, section or locale to open before scrolling: a few frames at most.
        const show = (frames: number) => {
            const element = root.current !== null ? findFieldElement(root.current, path) : null;
            if (element === null) {
                return;
            }
            if (element.closest('[hidden]') !== null && frames > 0) {
                requestAnimationFrame(() => show(frames - 1));
                return;
            }
            const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            element.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
            const target =
                element.querySelector<HTMLElement>('[aria-invalid="true"]') ??
                element.querySelector<HTMLElement>(FOCUSABLE);
            target?.focus({ preventScroll: true });
        };
        requestAnimationFrame(() => show(3));
    };

    const handle = (result: SubmitResult | null) => {
        if (result === null) {
            return;
        }
        if (result.status === 'invalid') {
            const first = Object.keys(orderErrors(order, result.errors, formLocales))[0];
            if (first !== undefined) {
                goTo(first);
            }
        } else if (result.status === 'submitted') {
            setSavedShown(true);
            if (showSavedToast && !hasFooter) {
                toasts.show(
                    { title: intl.formatMessage(messages.saved), tone: 'success' },
                    { key: 'panneau-form-saved' },
                );
            }
            onSubmitted?.(result.result);
        }
        // An error shows in the page: its alert, and the footer next to the button.
    };

    const resolve = async (choice: 'reload' | 'overwrite') => {
        if (choice === 'reload' && state.conflict?.current === null && onReload !== undefined) {
            onReload();
            return;
        }
        setResolving(true);
        await form
            .resolveConflict(choice)
            .then(handle)
            .finally(() => setResolving(false));
    };

    const problem = state.status === 'error' ? getProblem(state.error) : null;
    const errorDetail =
        problem?.detail ??
        (problem === null && state.error instanceof Error ? state.error.message : undefined);
    const showSummary = state.status === 'invalid' && state.submitCount > 0;

    if (isLoading) {
        return (
            <FormSkeleton
                main={laidOut}
                flow={flow}
                sidebar={resolved.layout.filter((node) => node.type === 'sidebar')}
                fields={resolved.fieldsByName}
                footer={hasFooter}
                className={className}
                layoutClassName={layoutClassName}
                sidebarClassName={sidebarClassName}
                footerClassName={footerClassName}
            />
        );
    }

    return (
        <FormContext value={form}>
            <RevealContext value={registry}>
                <FieldsProvider
                    components={entries}
                    locales={formLocales}
                    {...(relationSource !== undefined ? { relationSource } : {})}
                    {...(uploadSource !== undefined ? { uploadSource } : {})}
                    {...(checkSource !== undefined ? { checkSource } : {})}
                    binding={FormBinding}
                >
                    <form
                        ref={root}
                        id={id}
                        aria-label={ariaLabel}
                        noValidate
                        className={cx(styles.form, className)}
                        onSubmit={(event) => {
                            event.preventDefault();
                            void form.submit().then(handle);
                        }}
                    >
                        {showSummary ? (
                            <ErrorSummary
                                errors={orderErrors(order, state.errors, formLocales)}
                                fields={resolved.fields}
                                onSelect={goTo}
                                {...(summaryClassName !== undefined
                                    ? { className: summaryClassName }
                                    : {})}
                            />
                        ) : null}
                        {state.status === 'error' ? (
                            <Alert
                                tone="danger"
                                role="alert"
                                title={intl.formatMessage(messages.saveFailed)}
                                actions={
                                    <Button size="sm" type="submit">
                                        {intl.formatMessage(messages.retry)}
                                    </Button>
                                }
                            >
                                {errorDetail}
                            </Alert>
                        ) : null}
                        <div
                            className={cx(
                                styles.layout,
                                sidebar.length > 0 && styles.withSidebar,
                                layoutClassName,
                            )}
                        >
                            <div className={styles.stack}>
                                <LayoutNodes nodes={laidOut} fields={resolved.fieldsByName} />
                                {flow.length > 0 ? (
                                    <FieldFlow nodes={flow} fields={resolved.fieldsByName} />
                                ) : null}
                            </div>
                            {sidebar.length > 0 ? (
                                <aside className={cx(styles.sidebar, sidebarClassName)}>
                                    {sidebar.map((node, index) => (
                                        <div key={index} className={styles.stack}>
                                            <LayoutNodes
                                                nodes={node.children ?? []}
                                                fields={resolved.fieldsByName}
                                            />
                                        </div>
                                    ))}
                                </aside>
                            ) : null}
                        </div>
                        {hasFooter ? (
                            <div ref={footer} className={cx(styles.footer, footerClassName)}>
                                <span
                                    className={cx(
                                        styles.status,
                                        state.status === 'error' && styles.statusError,
                                    )}
                                    role="status"
                                >
                                    {state.status === 'error' ? (
                                        intl.formatMessage(messages.saveFailed)
                                    ) : state.dirty ? (
                                        intl.formatMessage(messages.unsaved)
                                    ) : savedShown && state.status !== 'submitting' ? (
                                        <>
                                            <Icon icon={CircleCheck} />
                                            {intl.formatMessage(messages.saved)}
                                        </>
                                    ) : null}
                                </span>
                                {actions}
                                {submitLabel !== null ? (
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isPending={state.status === 'submitting'}
                                    >
                                        {submitLabel ?? intl.formatMessage(messages.save)}
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </form>
                    <ConflictDialog
                        isOpen={state.status === 'conflict' || resolving}
                        fields={resolved.fields}
                        values={state.values}
                        current={state.conflict?.current ?? null}
                        isPending={resolving}
                        onReload={() => void resolve('reload')}
                        onOverwrite={() => void resolve('overwrite')}
                    />
                    {leave.dialog}
                </FieldsProvider>
            </RevealContext>
        </FormContext>
    );
}
