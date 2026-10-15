import { type Values, setValue } from '../values';

/**
 * Where the values of a form live. The form only reads and writes values through this interface,
 * so a shared store (Yjs, in `@panneau/collab`) can replace the local one. Errors, touched fields
 * and the submit status stay local to each form.
 */
export interface FormStore {
    /** The current values. The same object is returned until the values change. */
    getValues(): Values;
    /** Sets the value at a dot path. */
    setValue(path: string, value: unknown): void;
    /** Replaces every value. */
    setValues(values: Values): void;
    /** Calls `listener` after every change. Returns a function that unsubscribes. */
    subscribe(listener: () => void): () => void;
}

/** A store that keeps the values in memory. */
export function createLocalStore(initialValues: Values = {}): FormStore {
    let values = initialValues;
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());
    return {
        getValues: () => values,
        setValue(path, value) {
            values = setValue(values, path, value);
            notify();
        },
        setValues(next) {
            values = next;
            notify();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
