import { type ReactNode, type RefObject, useEffect, useEffectEvent, useRef, useState } from 'react';

import {
    type Form,
    type FormStatus,
    type SubmitResult,
    getEntries,
    getLayoutFieldNames,
    getProblem,
    resolveFields,
    selectVisible,
    useFormSelector,
    useLeaveGuard,
    usePanneau,
    usePlugins,
} from '@panneau/core';
import {
    type ContentLocale,
    ContentLocaleContext,
    type FieldCheckSource,
    type FieldEntry,
    FieldsProvider,
    type RelationSource,
    type RevealRegistry,
    type UploadSource,
    builtInFields,
} from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import {
    Alert,
    Aside,
    AsideLayout,
    Button,
    prefersReducedMotion,
    usePanneauIntl,
    usePreference,
    useToast,
    useToastOffset,
} from '@panneau/ui';

import { ConflictDialog, type ConflictDialogProps } from './ConflictDialog';
import { ContentLocaleSwitch } from './ContentLocaleSwitch';
import { ErrorSummary } from './ErrorSummary';
import styles from './Form.module.css';
import { FormBinding } from './FormBinding';
import { FormSkeleton } from './FormSkeleton';
import { hasLocalizedFields } from './contentLocale';
import { ErrorSectionsContext, FormContext, RevealContext, createRevealRegistry } from './context';
import { cx } from './cx';
import { FieldFlow, LayoutNodes, SidebarNode } from './layout/Layout';
import { messages } from './messages';
import { SaveContext, SaveControls, type SaveState, SummaryContext } from './panels/SaveControls';
import { type FormPanelComponent, PanelsContext, builtInPanels } from './panels/panels';
import { addSaveShortcut } from './shortcuts';
import { useBeforeUnloadGuard, useLeaveConfirmation } from './unsaved';

// Defaults shared by every render: the React Compiler doesn't memoize what is computed from an
// array made before a hook, and every render of the form would render all of its fields.
const NO_LAYOUT: readonly LayoutNode[] = [];
const NO_LOCALES: readonly string[] = [];
const NO_VALUES: Record<string, unknown> = Object.freeze({});

/** The conflict dialog, which follows the form's values while it is open only. */
function FormConflictDialog({
    form,
    isOpen,
    ...props
}: Omit<ConflictDialogProps, 'values'> & { form: Form }) {
    const values = useFormSelector(form, (state) => (isOpen ? state.values : NO_VALUES));
    return <ConflictDialog isOpen={isOpen} values={values} {...props} />;
}

declare module '@panneau/core' {
    interface PluginKinds {
        /**
         * Field components, by field type (`text`, `page-slug`). They replace the built-in field of
         * the same type. Declared by `@panneau/forms` and `@panneau/lists`, which render them:
         * `@panneau/fields` doesn't depend on `@panneau/core`.
         */
        fields: FieldEntry;
    }
}

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
    /**
     * Panels of the sidebar, by name, over the built-in ones and those of plugins: the app gives
     * its own (decision 0075).
     */
    panels?: Readonly<Record<string, FormPanelComponent>>;
    /** Label of the submit button. Defaults to "Save". `null` hides the button. */
    submitLabel?: ReactNode;
    /** Other buttons, next to the submit button. */
    actions?: ReactNode;
    /** Called after a successful submit, with what `onSubmit` returned. */
    onSubmitted?: (result: unknown) => void;
    /**
     * Called when the form gets unsaved changes, and when it no longer has any (saved, discarded,
     * or the form is gone), such as to mark the title of the page.
     */
    onDirtyChange?: (dirty: boolean) => void;
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
    /**
     * The key under which the browser remembers the collapsed panels of the sidebar
     * (`panneau:<key>-panel-<label>`), such as `form-articles`. Without one, they last as long as
     * the form.
     */
    sidebarStorageKey?: string;
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
 * Scrolls to the field of a path in a form, and focuses it. It waits for the tab, section or
 * locale of the field to open: a few frames at most.
 */
function showField(root: RefObject<HTMLElement | null>, path: string, frames: number): void {
    const element = root.current !== null ? findFieldElement(root.current, path) : null;
    if (element === null) {
        return;
    }
    if (element.closest('[hidden]') !== null && frames > 0) {
        requestAnimationFrame(() => showField(root, path, frames - 1));
        return;
    }
    element.scrollIntoView?.({
        block: 'center',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    const target =
        element.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        element.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
}

/**
 * The fields and the layout of a form, resolved in its mode (the required mark of a password
 * required on create shows on create only), the nodes of its main column, its visible sidebars,
 * and the names of its fields in order.
 *
 * A hook of its own for the React Compiler: it takes what a hook returns as frozen. Computed in
 * `FormView`, the handlers that read it (submit, conflict) made the compiler compute it again on
 * every render of the form, which then rendered all of its fields again.
 */
function useFormLayout(form: Form, fields: readonly Field[], layout: readonly LayoutNode[]) {
    // Which sidebars are visible, in order, as a string (`10`): it only changes when one shows or
    // hides
    const sidebarsShown = useFormSelector(form, (state) =>
        layout
            .filter((node) => node.type === 'sidebar')
            .map((node) => (selectVisible(state, node) ? '1' : '0'))
            .join(''),
    );
    const resolved = resolveFields(fields, layout, { mode: form.mode });
    const main = resolved.layout.filter((node) => node.type !== 'sidebar');
    // The fields that the layout doesn't place come last: they flow in columns
    const placed = new Set(getLayoutFieldNames(layout));
    let split = main.length;
    while (split > 0 && isUnplacedField(main[split - 1], placed)) {
        split -= 1;
    }
    // Sidebars are never pruned: those of the resolved layout are those of the layout, in order
    const sidebar = resolved.layout
        .filter((node) => node.type === 'sidebar')
        .filter((_, index) => sidebarsShown[index] === '1');
    return {
        resolved,
        laidOut: main.slice(0, split),
        flow: main.slice(split),
        sidebar,
        order: [
            ...getLayoutFieldNames(main),
            ...getLayoutFieldNames(sidebar.flatMap((node) => node.children ?? [])),
        ],
    };
}

/**
 * The ref of a form's element, and `goTo()`, which opens the tab, section or locale of a path,
 * then scrolls to its field and focuses it.
 *
 * A hook of its own for the React Compiler: in `FormView`, the ref, which `goTo()` reads, made one
 * scope of everything from the ref to the markup, hooks included, and the compiler memoized
 * nothing. Every render of the form then rendered all of its fields.
 */
function useGoToField(registry: RevealRegistry) {
    const root = useRef<HTMLFormElement>(null);
    const goTo = (path: string) => {
        registry.reveal(path);
        requestAnimationFrame(() => showField(root, path, 3));
    };
    return { root, goTo };
}

/**
 * Lets the form of `root` take ⌘ S and ⌘ Enter (Ctrl elsewhere) from anywhere on the page while
 * it is shown (see `addSaveShortcut()`).
 */
function useSaveShortcut(root: RefObject<HTMLFormElement | null>, isShown: boolean): void {
    useEffect(() => {
        const element = root.current;
        if (!isShown || element === null) {
            return undefined;
        }
        return addSaveShortcut(element);
    }, [root, isShown]);
}

/**
 * The language of the content of a form, which every localized field in it shows: the user's
 * last choice, remembered by the browser for every form (`panneau:content-locale`), or the first
 * locale. `null` without a switch: a single locale, or no localized field.
 */
function useContentLocaleState(
    locales: readonly string[],
    hasSwitch: boolean,
): ContentLocale | null {
    const [stored, store] = usePreference('content-locale', locales);
    const [changes, setChanges] = useState(0);
    const locale = stored !== null && locales.includes(stored) ? stored : locales[0];
    if (!hasSwitch || locale === undefined) {
        return null;
    }
    return {
        locale,
        changes,
        setLocale: (next) => {
            store(next);
            // A field switched on its own follows the form again, even to the same locale
            setChanges((count) => count + 1);
        },
    };
}

/** Whether a form has something to save. */
function canSaveState(mode: Form['mode'], dirty: boolean, status: FormStatus): boolean {
    return mode === 'create' || dirty || status === 'error';
}

/** Calls `onDirtyChange` when `dirty` changes, and with `false` when the form is gone. */
function useDirtyChange(dirty: boolean, onDirtyChange: ((dirty: boolean) => void) | undefined) {
    const report = useEffectEvent((value: boolean) => onDirtyChange?.(value));
    useEffect(() => {
        if (!dirty) {
            return undefined;
        }
        report(true);
        return () => report(false);
    }, [dirty]);
}

/**
 * Renders a form: its fields in their layout, bound to the form state of `@panneau/core`, with
 * an error summary, a scroll to the first error, error counts on tabs and sections, a guard for
 * unsaved changes and the dialog of version conflicts. Saving is the job of the form's
 * `onSubmit`.
 *
 * ⌘ S and ⌘ Enter (Ctrl elsewhere) save it from anywhere on the page, or from the dialog it is in.
 * An update without changes has nothing to save: its Save button is disabled, and submitting it
 * sends nothing. After a failed save, every collapsed section that holds an error opens, and the
 * first error is focused.
 */
export function FormView({
    form,
    fields,
    layout = NO_LAYOUT,
    locales,
    relationSource,
    uploadSource,
    checkSource,
    components,
    panels,
    submitLabel,
    actions,
    onSubmitted,
    onDirtyChange,
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
    sidebarStorageKey,
    footerClassName,
    summaryClassName,
}: FormViewProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const { definition } = usePanneau();
    const plugins = usePlugins();
    // Slices of the form state, so that a keystroke doesn't render the whole form again: fields
    // subscribe to their own (`FormBinding`)
    const dirty = useFormSelector(form, (state) => state.dirty);
    const status = useFormSelector(form, (state) => state.status);
    // The errors after a failed submit, for the summary: the form doesn't follow them otherwise
    const summaryErrors = useFormSelector(form, (state) =>
        state.status === 'invalid' && state.submitCount > 0 ? state.errors : null,
    );
    const submitError = useFormSelector(form, (state) => state.error);
    const conflict = useFormSelector(form, (state) => state.conflict);
    // A newer version arrived while the form had unsaved changes
    const hasNewer = useFormSelector(form, (state) => state.newer !== null);
    const [registry] = useState(createRevealRegistry);
    const { root, goTo } = useGoToField(registry);
    const [errorSections] = useState(createRevealRegistry);
    const [resolving, setResolving] = useState(false);
    const footer = useRef<HTMLDivElement>(null);
    const hasFooter = submitLabel !== null || actions !== undefined;
    // Toasts rise above the footer, which sticks to the bottom of the page.
    useToastOffset(footer, hasFooter && !isLoading);
    // "Saved" in the footer, from the last submit or from before the form started over, until the
    // values change.
    const [savedShown, setSavedShown] = useState(saved);
    if (savedShown && dirty) {
        setSavedShown(false);
    }
    useDirtyChange(dirty, onDirtyChange);
    useSaveShortcut(root, !isLoading);
    // An update without changes has nothing to save, unless its last save failed: it can be tried
    // again. A form with a newer version has changes.
    const canSave = canSaveState(form.mode, dirty, status);
    const guarded = guardUnsavedChanges && dirty;
    useBeforeUnloadGuard(guarded);
    // Leaving through the app's router asks first, in a dialog
    const leave = useLeaveConfirmation(guarded);
    useLeaveGuard(guarded, leave.confirmLeave);

    const formLocales = locales ?? definition?.locales ?? NO_LOCALES;
    const { resolved, laidOut, flow, sidebar, order } = useFormLayout(form, fields, layout);
    const contentLocale = useContentLocaleState(
        formLocales,
        formLocales.length > 1 && hasLocalizedFields(resolved.fields),
    );
    const panelEntries = getEntries(plugins, 'panels', {
        builtIn: builtInPanels,
        overrides: panels,
    });
    // Beside the form, the `save` and `errors` panels take the place of the footer and of the
    // summary at the top (decision 0075)
    const hasPanel = (name: string) => sidebar.some((node) => node.panel === name);
    const entries: Record<string, FieldEntry> = Object.fromEntries(
        getEntries(plugins, 'fields', { builtIn: builtInFields, overrides: components }),
    );

    const handle = (result: SubmitResult | null) => {
        if (result === null) {
            return;
        }
        if (result.status === 'invalid') {
            // Every collapsed section with an error opens: what is left to fix shows while
            // scrolling down
            Object.keys(result.errors).forEach((path) => errorSections.reveal(path));
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
        if (choice === 'reload' && conflict?.current === null && onReload !== undefined) {
            onReload();
            return;
        }
        setResolving(true);
        await form
            .resolveConflict(choice)
            .then(handle)
            .finally(() => setResolving(false));
    };

    const problem = status === 'error' ? getProblem(submitError) : null;
    const errorDetail =
        problem?.detail ??
        (problem === null && submitError instanceof Error ? submitError.message : undefined);
    const showSummary = summaryErrors !== null;
    const orderedErrors =
        summaryErrors !== null ? orderErrors(order, summaryErrors, formLocales) : {};
    const save: SaveState = {
        status:
            status === 'error'
                ? 'error'
                : dirty
                  ? 'unsaved'
                  : savedShown && status !== 'submitting'
                    ? 'saved'
                    : null,
        isSubmitting: status === 'submitting',
        canSave,
        actions,
        submitLabel: submitLabel === undefined ? intl.formatMessage(messages.save) : submitLabel,
    };

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
            <PanelsContext value={panelEntries}>
                <SaveContext value={save}>
                    <SummaryContext
                        value={{ errors: orderedErrors, fields: resolved.fields, onSelect: goTo }}
                    >
                        <RevealContext value={registry}>
                            <ErrorSectionsContext value={errorSections}>
                                <ContentLocaleContext value={contentLocale}>
                                    <FieldsProvider
                                        components={entries}
                                        locales={formLocales}
                                        {...(relationSource !== undefined
                                            ? { relationSource }
                                            : {})}
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
                                                // Enter in a field, or a shortcut, with nothing to
                                                // save: no request. Read from the form now: a submit
                                                // button can set values first (Publish), before this
                                                // render knows them.
                                                const latest = form.getState();
                                                if (
                                                    canSaveState(
                                                        form.mode,
                                                        latest.dirty,
                                                        latest.status,
                                                    )
                                                ) {
                                                    void form.submit().then(handle);
                                                }
                                            }}
                                        >
                                            {showSummary ? (
                                                <ErrorSummary
                                                    errors={orderedErrors}
                                                    fields={resolved.fields}
                                                    onSelect={goTo}
                                                    className={cx(
                                                        summaryClassName ?? styles.summary,
                                                        hasPanel('errors') &&
                                                            styles.besideAsideHidden,
                                                    )}
                                                />
                                            ) : null}
                                            {status === 'error' ? (
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
                                            {hasNewer ? (
                                                <Alert
                                                    tone="warning"
                                                    role="status"
                                                    title={intl.formatMessage(messages.newerTitle)}
                                                    actions={
                                                        <Button
                                                            size="sm"
                                                            onPress={() => form.reviewNewer()}
                                                        >
                                                            {intl.formatMessage(
                                                                messages.reviewNewer,
                                                            )}
                                                        </Button>
                                                    }
                                                >
                                                    {intl.formatMessage(messages.newerMessage)}
                                                </Alert>
                                            ) : null}
                                            {contentLocale !== null ? (
                                                <ContentLocaleSwitch
                                                    form={form}
                                                    fields={resolved.fields}
                                                    locales={formLocales}
                                                    locale={contentLocale.locale}
                                                    onChange={contentLocale.setLocale}
                                                />
                                            ) : null}
                                            <AsideLayout
                                                className={layoutClassName}
                                                mainClassName={styles.stack}
                                                aside={
                                                    sidebar.length > 0 ? (
                                                        <Aside
                                                            label={intl.formatMessage(
                                                                messages.sidebar,
                                                            )}
                                                            className={sidebarClassName}
                                                        >
                                                            {sidebar.map((node, index) => (
                                                                <SidebarNode
                                                                    key={index}
                                                                    node={node}
                                                                    fields={resolved.fieldsByName}
                                                                    storageKey={sidebarStorageKey}
                                                                />
                                                            ))}
                                                        </Aside>
                                                    ) : null
                                                }
                                            >
                                                <LayoutNodes
                                                    nodes={laidOut}
                                                    fields={resolved.fieldsByName}
                                                />
                                                {flow.length > 0 ? (
                                                    <FieldFlow
                                                        nodes={flow}
                                                        fields={resolved.fieldsByName}
                                                    />
                                                ) : null}
                                            </AsideLayout>
                                            {hasFooter ? (
                                                <div
                                                    ref={footer}
                                                    className={cx(
                                                        styles.footer,
                                                        hasPanel('save') &&
                                                            styles.besideAsideHidden,
                                                        footerClassName,
                                                    )}
                                                >
                                                    <SaveControls {...save} />
                                                </div>
                                            ) : null}
                                        </form>
                                        <FormConflictDialog
                                            form={form}
                                            isOpen={status === 'conflict' || resolving}
                                            fields={resolved.fields}
                                            current={conflict?.current ?? null}
                                            isPending={resolving}
                                            onReload={() => void resolve('reload')}
                                            onOverwrite={() => void resolve('overwrite')}
                                        />
                                        {leave.dialog}
                                    </FieldsProvider>
                                </ContentLocaleContext>
                            </ErrorSectionsContext>
                        </RevealContext>
                    </SummaryContext>
                </SaveContext>
            </PanelsContext>
        </FormContext>
    );
}
