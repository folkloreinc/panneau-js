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
    type FieldEntry,
    FieldsProvider,
    type RelationSource,
    type UploadSource,
    builtInFields,
} from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import { Alert, Button, usePanneauIntl, useToast } from '@panneau/ui';

import { ConflictDialog } from './ConflictDialog';
import { ErrorSummary } from './ErrorSummary';
import styles from './Form.module.css';
import { FormBinding } from './FormBinding';
import { FormContext, RevealContext, createRevealRegistry, useFormState } from './context';
import { cx } from './cx';
import { LayoutNodes } from './layout/Layout';
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
    /** Shows a toast after a successful submit. Defaults to true. */
    showSavedToast?: boolean;
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
 * the order of the paths inside them (`blocks.2.body` before `blocks.10.body`).
 */
function orderErrors(
    names: readonly string[],
    errors: Record<string, string[]>,
): Record<string, string[]> {
    const rank = (path: string) => {
        const index = names.indexOf(path.split('.')[0] ?? '');
        return index === -1 ? names.length : index;
    };
    const compare = (a: string, b: string) =>
        rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true });
    return Object.fromEntries(Object.entries(errors).sort(([a], [b]) => compare(a, b)));
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
    components,
    submitLabel,
    actions,
    onSubmitted,
    onReload,
    guardUnsavedChanges = true,
    showSavedToast = true,
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
    const guarded = guardUnsavedChanges && state.dirty;
    useBeforeUnloadGuard(guarded);
    // Leaving through the app's router asks first, in a dialog
    const leave = useLeaveConfirmation(guarded);
    useLeaveGuard(guarded, leave.confirmLeave);

    const resolved = resolveFields(fields, layout);
    const main = resolved.layout.filter((node) => node.type !== 'sidebar');
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

    /** Opens the tab or section of a path, then scrolls to its field and focuses it. */
    const goTo = (path: string) => {
        registry.reveal(path);
        // Wait for the tab or section to open before scrolling.
        requestAnimationFrame(() => {
            const element = root.current !== null ? findFieldElement(root.current, path) : null;
            if (element === null) {
                return;
            }
            const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            element.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
            const target =
                element.querySelector<HTMLElement>('[aria-invalid="true"]') ??
                element.querySelector<HTMLElement>(FOCUSABLE);
            target?.focus({ preventScroll: true });
        });
    };

    const handle = (result: SubmitResult | null) => {
        if (result === null) {
            return;
        }
        if (result.status === 'invalid') {
            const first = Object.keys(orderErrors(order, result.errors))[0];
            if (first !== undefined) {
                goTo(first);
            }
        } else if (result.status === 'submitted') {
            if (showSavedToast) {
                toasts.show({ title: intl.formatMessage(messages.saved), tone: 'success' });
            }
            onSubmitted?.(result.result);
        } else if (result.status === 'error') {
            toasts.show(
                {
                    title: intl.formatMessage(messages.saveFailed),
                    tone: 'danger',
                    action: {
                        label: intl.formatMessage(messages.retry),
                        onAction: () => void form.submit().then(handle),
                    },
                },
                { timeout: 8000 },
            );
        }
    };

    const resolve = async (choice: 'reload' | 'overwrite') => {
        if (choice === 'reload' && state.conflict?.current === null && onReload !== undefined) {
            onReload();
            return;
        }
        setResolving(true);
        try {
            handle(await form.resolveConflict(choice));
        } finally {
            setResolving(false);
        }
    };

    const problem = state.status === 'error' ? getProblem(state.error) : null;
    const errorDetail =
        problem?.detail ??
        (problem === null && state.error instanceof Error ? state.error.message : undefined);
    const showSummary = state.status === 'invalid' && state.submitCount > 0;

    return (
        <FormContext value={form}>
            <RevealContext value={registry}>
                <FieldsProvider
                    components={entries}
                    locales={locales ?? definition?.locales ?? []}
                    {...(relationSource !== undefined ? { relationSource } : {})}
                    {...(uploadSource !== undefined ? { uploadSource } : {})}
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
                                errors={orderErrors(order, state.errors)}
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
                                <LayoutNodes nodes={main} fields={resolved.fieldsByName} />
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
                        {submitLabel !== null || actions !== undefined ? (
                            <div className={cx(styles.footer, footerClassName)}>
                                {state.dirty ? (
                                    <span className={styles.dirty} role="status">
                                        {intl.formatMessage(messages.unsaved)}
                                    </span>
                                ) : null}
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
