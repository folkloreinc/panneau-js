/*
 * Reads of a form state. React components read the state they subscribed to (`useForm()`, or
 * `useSyncExternalStore(form.subscribe, form.getState)`) through these selectors, not through the
 * form's methods: the React Compiler memoizes calls by their arguments, and a method such as
 * `form.getErrors(path)` reads the store, so its memoized result goes stale. A selector takes the
 * state as an argument, so the compiler calls it again when the state changes.
 */
import { type Condition, evaluateCondition, getValue } from '@panneau/protocol';

import { isPathWithin } from '../values';
import type { FormState, GetErrorsOptions } from './form';

/** The value at a dot path (`title.fr`). */
export function selectValue(state: FormState, path: string): unknown {
    return getValue(state.values, path);
}

/** Errors at a path, and with `nested` at the paths inside it (`title.fr` for `title`). */
export function selectErrors(
    state: FormState,
    path: string,
    options: GetErrorsOptions = {},
): string[] {
    const { nested = false } = options;
    return Object.entries(state.errors).flatMap(([key, messages]) =>
        key === path || (nested && isPathWithin(key, path)) ? messages : [],
    );
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
