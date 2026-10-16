import { createContext, use, useSyncExternalStore } from 'react';

import type { Form, FormState } from '@panneau/core';

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
