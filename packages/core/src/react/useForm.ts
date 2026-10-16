import { useLayoutEffect, useState, useSyncExternalStore } from 'react';

import { type Form, type FormOptions, type FormState, createForm } from '../form/form';
import { selectErrors, selectValue } from '../form/selectors';

export interface UseFormResult extends FormState {
    /** The form, to change values, submit, reset or resolve a conflict. */
    form: Form;
}

/**
 * Creates a form for the life of the component. `fields`, `locales`, `formatError` and `onSubmit`
 * follow the latest render; initial values and the version don't: call `form.reset()`, or give
 * the component a new `key`, to start from another item.
 *
 * Read the returned state with the selectors (`selectErrors(state, path)`,
 * `selectVisible(state, field)`…), not with the form's reading methods, which go stale with the
 * React Compiler (see {@link Form}).
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
        value: selectValue(state, path),
        onChange: (value) => form.setValue(path, value),
        onBlur: () => form.blur(path),
        errors: selectErrors(state, path, { nested: true }),
        touched: state.touched.has(path),
    };
}
