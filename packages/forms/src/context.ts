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

// The reveal registry is in `@panneau/fields`, for the fields that hide some of their own (the
// locales of a localized field).
export { RevealContext, createRevealRegistry } from '@panneau/fields';
