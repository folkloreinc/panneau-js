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
 * React Compiler (see {@link Form}). The component renders again on every change of the state:
 * the parts of a form subscribe to the slices they show with `useFormSelector()`.
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

/**
 * A slice of a form's state, which renders the component again only when the slice changes: a
 * field subscribes to its value and its errors, not to every change of the form. `select` must
 * return the same value for the same state: a primitive, or what the selectors return (the value
 * at a path, the errors of a path). A new object on every call would render the component again
 * and again.
 */
export function useFormSelector<T>(form: Form, select: (state: FormState) => T): T {
    const getSnapshot = () => select(form.getState());
    return useSyncExternalStore(form.subscribe, getSnapshot, getSnapshot);
}

export interface UseFormFieldResult {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    /** Errors at the path, and at nested paths (`title.fr` for `title`). */
    errors: readonly string[];
    touched: boolean;
}

/**
 * Props for a controlled field at a dot path of a form. The component renders again when the
 * field's value, errors or touched state change, not on every change of the form.
 */
export function useFormField(form: Form, path: string): UseFormFieldResult {
    return {
        value: useFormSelector(form, (state) => selectValue(state, path)),
        onChange: (value) => form.setValue(path, value),
        onBlur: () => form.blur(path),
        errors: useFormSelector(form, (state) => selectErrors(state, path, { nested: true })),
        touched: useFormSelector(form, (state) => state.touched.has(path)),
    };
}
