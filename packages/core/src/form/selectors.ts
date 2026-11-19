/*
 * Reads of a form state. React components read the state they subscribed to (a slice with
 * `useFormSelector(form, select)`, or the whole state with `useForm()`) through these selectors,
 * not through the form's methods: the React Compiler memoizes calls by their arguments, and a
 * method such as `form.getErrors(path)` reads the store, so its memoized result goes stale. A
 * selector takes the state as an argument, so the compiler calls it again when the state changes.
 */
import type { Condition } from '@panneau/protocol';
import { evaluateCondition, getValue } from '@panneau/protocol/runtime';

import { isPathWithin } from '../values';
import type { FormState, GetErrorsOptions } from './form';

/** The value at a dot path (`title.fr`). */
export function selectValue(state: FormState, path: string): unknown {
    return getValue(state.values, path);
}

/**
 * The errors of a path without any. Selectors return the same arrays for the same errors, so that
 * a component that subscribes to a slice of the state (`useFormSelector()`) doesn't render again,
 * and the React Compiler keeps what it rendered from them.
 */
const EMPTY: readonly string[] = Object.freeze([]);

/** Errors with nested ones, by path, for each `errors` object of a state. */
const nestedErrors = new WeakMap<FormState['errors'], Map<string, readonly string[]>>();

/**
 * Errors at a path, and with `nested` at the paths inside it (`title.fr` for `title`). The same
 * array is returned for the same `state.errors`, and an empty one is always the same.
 */
export function selectErrors(
    state: FormState,
    path: string,
    options: GetErrorsOptions = {},
): readonly string[] {
    const { errors } = state;
    if (options.nested !== true) {
        return (Object.hasOwn(errors, path) ? errors[path] : undefined) ?? EMPTY;
    }
    let cache = nestedErrors.get(errors);
    if (cache === undefined) {
        cache = new Map();
        nestedErrors.set(errors, cache);
    }
    let selected = cache.get(path);
    if (selected === undefined) {
        const keys = Object.keys(errors).filter((key) => isPathWithin(key, path));
        const [only] = keys;
        selected =
            only === undefined
                ? EMPTY
                : keys.length === 1
                  ? (errors[only] ?? EMPTY)
                  : keys.flatMap((key) => errors[key] ?? []);
        cache.set(path, selected);
    }
    return selected;
}

/** The number of paths with errors within the given paths, for counts on tabs and sections. */
export function selectErrorCount(state: FormState, paths: readonly string[]): number {
    return Object.keys(state.errors).filter((key) => paths.some((path) => isPathWithin(key, path)))
        .length;
}

/**
 * Whether a field or a layout node is visible, from its `visibleWhen`. For nested fields, pass
 * the path of the object they belong to (`blocks.2`): conditions are relative to it.
 */
export function selectVisible(
    state: FormState,
    target: { visibleWhen?: Condition | undefined },
    parentPath = '',
): boolean {
    return (
        target.visibleWhen === undefined ||
        evaluateCondition(target.visibleWhen, getValue(state.values, parentPath))
    );
}
