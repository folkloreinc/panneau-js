import { useLayoutEffect, useState, useSyncExternalStore } from 'react';

import { getValue } from '@panneau/protocol';

import { type Form, type FormOptions, type FormState, createForm } from '../form/form';
import { isPathWithin } from '../values';

export interface UseFormResult extends FormState {
    /** The form, to change values, submit, reset or resolve a conflict. */
    form: Form;
}

/**
 * Creates a form for the life of the component. `fields`, `locales`, `formatError` and `onSubmit`
 * follow the latest render; initial values and the version don't: call `form.reset()`, or give
 * the component a new `key`, to start from another item.
 */
export function useForm(options: FormOptions): UseFormResult {
    const [form] = useState(() => createForm(options));
    const { fields, locales, formatError, onSubmit } = options;
    useLayoutEffect(() => {
        form.setOptions({ fields, locales, formatError, onSubmit });
    });
    const state = useSyncExternalStore(form.subscribe, form.getState, form.getState);
    return { ...state, form };
}

export interface UseFormFieldResult {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    /** Errors at the path, and at nested paths (`title.fr` for `title`). */
    errors: string[];
    touched: boolean;
}

/** Props for a controlled field at a dot path of a form. */
export function useFormField(form: Form, path: string): UseFormFieldResult {
    const state = useSyncExternalStore(form.subscribe, form.getState, form.getState);
    return {
        value: getValue(state.values, path),
        onChange: (value) => form.setValue(path, value),
        onBlur: () => form.blur(path),
        errors: Object.entries(state.errors).flatMap(([key, messages]) =>
            isPathWithin(key, path) ? messages : [],
        ),
        touched: state.touched.has(path),
    };
}
