import { createContext, use, useSyncExternalStore } from 'react';

import type { Form, FormState } from '@panneau/core';
import { type Condition, evaluateCondition, getValue } from '@panneau/protocol';

export const FormContext = createContext<Form | null>(null);

/** The form of the closest `FormView`. */
export function useFormContext(): Form {
    const form = use(FormContext);
    if (form === null) {
        throw new Error('This component must be rendered inside a <Form> or a <FormView>.');
    }
    return form;
}

/** The state of a form, updated on every change. */
export function useFormState(form: Form): FormState {
    return useSyncExternalStore(form.subscribe, form.getState, form.getState);
}

/** Opens the containers (tabs, sections) that hold a path, so that its field can be reached. */
export type Revealer = (path: string) => void;

export interface RevealRegistry {
    add(revealer: Revealer): () => void;
    reveal(path: string): void;
}

export function createRevealRegistry(): RevealRegistry {
    const revealers = new Set<Revealer>();
    return {
        add(revealer) {
            revealers.add(revealer);
            return () => {
                revealers.delete(revealer);
            };
        },
        reveal(path) {
            revealers.forEach((revealer) => revealer(path));
        },
    };
}

export const RevealContext = createContext<RevealRegistry>(createRevealRegistry());

/*
 * Reads of the form state. Components read the state they subscribed to, never the form's
 * methods: the React Compiler memoizes method calls by their arguments, so a method that reads
 * the store would return stale results.
 */

/** Whether a path is a path or inside it (`title.fr` is inside `title`). */
function isWithin(path: string, parent: string): boolean {
    return parent === '' || path === parent || path.startsWith(`${parent}.`);
}

/** Errors at a path, and with `nested` at the paths inside it. */
export function selectErrors(state: FormState, path: string, nested = false): string[] {
    return Object.entries(state.errors).flatMap(([key, messages]) =>
        key === path || (nested && isWithin(key, path)) ? messages : [],
    );
}

/** The number of paths with errors within the given paths. */
export function selectErrorCount(state: FormState, paths: readonly string[]): number {
    return Object.keys(state.errors).filter((key) => paths.some((path) => isWithin(key, path)))
        .length;
}

/** Whether a field or a node is visible, from its `visibleWhen` on the values at `parentPath`. */
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
