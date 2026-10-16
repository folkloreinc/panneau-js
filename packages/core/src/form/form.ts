import {
    type Condition,
    type Field,
    type Item,
    type RuleFailure,
    checkValues,
    getValue,
} from '@panneau/protocol';

import type { FormMode } from '../definition/form';
import { type Values, isEqual, isPathWithin } from '../values';
import { formatRuleFailure } from './messages';
import { getItemValues, getProblem, isItem } from './problem';
import { selectErrorCount, selectErrors, selectValue, selectVisible } from './selectors';
import { type FormStore, createLocalStore } from './store';

/**
 * - `idle`: nothing submitted yet, or after a reset;
 * - `submitting`: waiting for `onSubmit`;
 * - `submitted`: the last submit succeeded;
 * - `invalid`: client validation or the server (`422`) found errors;
 * - `conflict`: the item changed since the form's version (`412`), see `resolveConflict()`;
 * - `error`: the last submit failed for another reason (network, `403`, `500`…), see `error`.
 */
export type FormStatus = 'idle' | 'submitting' | 'submitted' | 'invalid' | 'conflict' | 'error';

export interface FormConflict {
    /** The current version of the item, when the backend sent it. */
    current: Item | null;
}

/** A snapshot of a form. A new object is created on every change. */
export interface FormState {
    values: Values;
    /** The values the form started from, or was last saved with. `dirty` compares to them. */
    initialValues: Values;
    /** The version of the item the values were edited from, sent with the submit. */
    version: string | null;
    /** Whether the values differ from the initial values. */
    dirty: boolean;
    /**
     * Errors shown, by dot path (`title.fr`): client errors of touched fields (all of them after a
     * submit), then server errors. A server error goes away when its value changes.
     */
    errors: Record<string, string[]>;
    /** Paths of the fields that lost focus at least once. */
    touched: ReadonlySet<string>;
    status: FormStatus;
    /** With the `conflict` status: what the backend says is current. */
    conflict: FormConflict | null;
    /** With the `error` status: what `onSubmit` threw. */
    error: unknown;
    submitCount: number;
}

export interface SubmitContext {
    mode: FormMode;
    /** The version to send as `If-Match`. */
    version: string | null;
    /** The top-level values that differ from the initial values, for partial updates. */
    changes: Values;
}

export type SubmitResult =
    | { status: 'submitted'; result: unknown }
    | { status: 'invalid'; errors: Record<string, string[]> }
    | { status: 'conflict'; current: Item | null }
    | { status: 'error'; error: unknown };

export interface FormOptions {
    /** The fields of the form, as resolved by `resolveForm()`. */
    fields: Field[];
    /** Initial values. In `create` mode, fields without a value get their `default`. */
    values?: Values;
    /** The version of the item the values come from. */
    version?: string | null;
    /** Defaults to `update` when a version is given, `create` otherwise. */
    mode?: FormMode;
    /** Locales a `required` localized field must be filled in (all of them, usually). */
    locales?: string[];
    /** Where the values live. Defaults to a local store. */
    store?: FormStore;
    /** Message of a failed rule. Defaults to `formatRuleFailure()`. */
    formatError?: (failure: RuleFailure, path: string) => string;
    /**
     * Saves the values. When it returns an item, the form continues from that item. When it
     * throws an error that carries problem details (`getProblem()`), `422` errors are shown by
     * path and `412` puts the form in the `conflict` status.
     */
    onSubmit?: (values: Values, context: SubmitContext) => unknown;
}

/** Form options that can change after the form is created. */
export type UpdatableFormOptions = Pick<
    FormOptions,
    'fields' | 'locales' | 'formatError' | 'onSubmit'
>;

export interface GetErrorsOptions {
    /** Also return the errors of nested paths (`title.fr` for `title`). */
    nested?: boolean;
}

/**
 * A headless form: values, errors, visibility and submit. React components use `useForm()`.
 *
 * The methods that read the state (`getValue()`, `getErrors()`, `countErrors()`, `isVisible()`)
 * are not React APIs: the React Compiler memoizes their calls by their arguments, so they return
 * stale results in components. Components read the state they subscribed to with the selectors
 * (`selectValue()`, `selectErrors()`, `selectErrorCount()`, `selectVisible()`).
 */
export interface Form {
    getState(): FormState;
    subscribe(listener: () => void): () => void;
    /** Updates the options that can change between renders. */
    setOptions(options: Partial<UpdatableFormOptions>): void;
    /**
     * The value at a dot path. Not a React API: components use `selectValue(state, path)` (see
     * {@link Form}).
     */
    getValue(path: string): unknown;
    setValue(path: string, value: unknown): void;
    /** Marks a field as touched, which shows its client errors. */
    blur(path: string): void;
    /**
     * Errors at a path. Not a React API: components use `selectErrors(state, path, options)` (see
     * {@link Form}).
     */
    getErrors(path: string, options?: GetErrorsOptions): string[];
    /**
     * The number of paths with errors within the given paths, for counts on tabs and sections. Not
     * a React API: components use `selectErrorCount(state, paths)` (see {@link Form}).
     */
    countErrors(paths: readonly string[]): number;
    /**
     * Whether a field or a layout node is visible, from its `visibleWhen`. For nested fields, pass
     * the path of the object they belong to (`blocks.2`): conditions are relative to it. Not a
     * React API: components use `selectVisible(state, target, parentPath)` (see {@link Form}).
     */
    isVisible(target: { visibleWhen?: Condition | undefined }, parentPath?: string): boolean;
    /** Checks every value with the portable rules and shows every error. Returns whether valid. */
    validate(): boolean;
    /** Shows server errors, by dot path. */
    setServerErrors(errors: Record<string, string[]>): void;
    /** Validates, then calls `onSubmit`. */
    submit(): Promise<SubmitResult>;
    /** Starts over from new values (or the initial ones), and a new version. */
    reset(values?: Values, version?: string | null): void;
    /**
     * Leaves the `conflict` status:
     *
     * - `reload` drops the local changes and continues from the current item;
     * - `overwrite` keeps the local changes and submits them again over the current version.
     */
    resolveConflict(choice: 'reload' | 'overwrite'): Promise<SubmitResult | null>;
}

/** Initial values of fields that have a `default` and no value. */
export function getDefaultValues(fields: readonly Field[], values: Values = {}): Values {
    return fields.reduce<Values>(
        (result, field) =>
            field.default !== undefined && result[field.name] === undefined
                ? { ...result, [field.name]: field.default }
                : result,
        values,
    );
}

function mergeErrors(...sources: Record<string, string[]>[]): Record<string, string[]> {
    const merged: Record<string, string[]> = {};
    sources.forEach((source) =>
        Object.entries(source).forEach(([path, messages]) => {
            merged[path] = [...(merged[path] ?? []), ...messages];
        }),
    );
    return merged;
}

/** Creates a headless form. */
export function createForm(options: FormOptions): Form {
    const current: Required<UpdatableFormOptions> = {
        fields: options.fields,
        locales: options.locales ?? [],
        formatError: options.formatError ?? formatRuleFailure,
        onSubmit: options.onSubmit ?? (() => undefined),
    };
    const mode: FormMode =
        options.mode ??
        (options.version !== undefined && options.version !== null ? 'update' : 'create');
    const startValues =
        mode === 'create'
            ? getDefaultValues(options.fields, options.values)
            : (options.values ?? {});
    const store = options.store ?? createLocalStore(startValues);
    if (options.store !== undefined && options.values !== undefined) {
        store.setValues(startValues);
    }

    let initialValues = store.getValues();
    let version = options.version ?? null;
    let touched: ReadonlySet<string> = new Set();
    let serverErrors: Record<string, string[]> = {};
    let status: FormStatus = 'idle';
    let conflict: FormConflict | null = null;
    let error: unknown = null;
    let submitCount = 0;
    let pending: Promise<SubmitResult> | null = null;

    const listeners = new Set<() => void>();
    let unsubscribeStore: (() => void) | null = null;

    const clientErrors = (values: Values, all: boolean): Record<string, string[]> => {
        const failures = checkValues(current.fields, values, { mode, locales: current.locales });
        return Object.fromEntries(
            Object.entries(failures)
                .filter(
                    ([path]) => all || [...touched].some((parent) => isPathWithin(path, parent)),
                )
                .map(([path, list]) => [
                    path,
                    list.map((failure) => current.formatError(failure, path)),
                ]),
        );
    };

    const compute = (values: Values): FormState => ({
        values,
        initialValues,
        version,
        dirty: !isEqual(values, initialValues),
        errors: mergeErrors(clientErrors(values, submitCount > 0), serverErrors),
        touched,
        status,
        conflict,
        error,
        submitCount,
    });

    let state = compute(store.getValues());

    const update = () => {
        state = compute(store.getValues());
        listeners.forEach((listener) => listener());
    };

    /** Server errors go away when their value changes. */
    const onStoreChange = () => {
        const previous = state.values;
        const values = store.getValues();
        if (values === previous) {
            return;
        }
        serverErrors = Object.fromEntries(
            Object.entries(serverErrors).filter(([path]) =>
                isEqual(getValue(previous, path), getValue(values, path)),
            ),
        );
        update();
    };

    const changes = (values: Values): Values =>
        Object.fromEntries(
            Object.entries({ ...initialValues, ...values }).flatMap(([key]) =>
                isEqual(values[key], initialValues[key]) ? [] : [[key, values[key]]],
            ),
        );

    const fieldNames = () => current.fields.map((field) => field.name);

    const reset = (values?: Values, nextVersion?: string | null) => {
        if (nextVersion !== undefined) {
            version = nextVersion;
        }
        touched = new Set();
        serverErrors = {};
        status = 'idle';
        conflict = null;
        error = null;
        submitCount = 0;
        if (values !== undefined) {
            initialValues = values;
            store.setValues(values);
        } else {
            store.setValues(initialValues);
        }
        update();
    };

    const runSubmit = async (): Promise<SubmitResult> => {
        submitCount += 1;
        serverErrors = {};
        const values = store.getValues();
        const errors = clientErrors(values, true);
        if (Object.keys(errors).length > 0) {
            status = 'invalid';
            update();
            return { status: 'invalid', errors };
        }
        status = 'submitting';
        conflict = null;
        error = null;
        update();
        try {
            const result = await current.onSubmit(values, {
                mode,
                version,
                changes: changes(values),
            });
            if (isItem(result)) {
                const saved = getItemValues(result, fieldNames());
                version = result.version;
                initialValues = saved;
                // Keep what was typed while saving; otherwise take the saved values.
                if (store.getValues() === values) {
                    store.setValues(saved);
                }
            } else {
                initialValues = values;
            }
            touched = new Set();
            submitCount = 0;
            status = 'submitted';
            update();
            return { status: 'submitted', result };
        } catch (caught) {
            const problem = getProblem(caught);
            if (problem?.status === 412) {
                status = 'conflict';
                conflict = { current: problem.current ?? null };
                update();
                return { status: 'conflict', current: conflict.current };
            }
            if (problem?.status === 422 && problem.errors !== undefined) {
                status = 'invalid';
                serverErrors = problem.errors;
                update();
                return { status: 'invalid', errors: problem.errors };
            }
            status = 'error';
            error = caught;
            update();
            return { status: 'error', error: caught };
        }
    };

    const form: Form = {
        getState() {
            if (unsubscribeStore === null) {
                onStoreChange();
            }
            return state;
        },
        subscribe(listener) {
            listeners.add(listener);
            unsubscribeStore ??= store.subscribe(onStoreChange);
            onStoreChange();
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0 && unsubscribeStore !== null) {
                    unsubscribeStore();
                    unsubscribeStore = null;
                }
            };
        },
        setOptions(next) {
            const { fields, locales, formatError, onSubmit } = next;
            if (onSubmit !== undefined) {
                current.onSubmit = onSubmit;
            }
            if (formatError !== undefined) {
                current.formatError = formatError;
            }
            // Fields and locales change what is valid: compare them by value, since a render can
            // create new arrays with the same content.
            const changed =
                (fields !== undefined && !isEqual(fields, current.fields)) ||
                (locales !== undefined && !isEqual(locales, current.locales));
            if (fields !== undefined) {
                current.fields = fields;
            }
            if (locales !== undefined) {
                current.locales = locales;
            }
            if (changed) {
                update();
            }
        },
        getValue: (path) => selectValue(form.getState(), path),
        setValue(path, value) {
            store.setValue(path, value);
            if (unsubscribeStore === null) {
                onStoreChange();
            }
        },
        blur(path) {
            if (touched.has(path)) {
                return;
            }
            touched = new Set([...touched, path]);
            update();
        },
        getErrors: (path, getErrorsOptions) =>
            selectErrors(form.getState(), path, getErrorsOptions),
        countErrors: (paths) => selectErrorCount(form.getState(), paths),
        isVisible: (target, parentPath) => selectVisible(form.getState(), target, parentPath),
        validate() {
            submitCount = Math.max(submitCount, 1);
            update();
            return Object.keys(clientErrors(store.getValues(), true)).length === 0;
        },
        setServerErrors(errors) {
            serverErrors = errors;
            update();
        },
        submit() {
            pending ??= runSubmit().finally(() => {
                pending = null;
            });
            return pending;
        },
        reset,
        async resolveConflict(choice) {
            if (status !== 'conflict' || conflict === null) {
                return null;
            }
            const latest = conflict.current;
            if (choice === 'reload') {
                if (latest !== null) {
                    reset(getItemValues(latest, fieldNames()), latest.version);
                } else {
                    status = 'idle';
                    conflict = null;
                    update();
                }
                return null;
            }
            if (latest !== null) {
                version = latest.version;
            }
            conflict = null;
            return form.submit();
        },
    };
    return form;
}
