import { ForwardedRef, RefObject } from 'react';

export default function mergeRefs<T>(...refs: Array<ForwardedRef<T> | null | undefined>) {
    return (value: T | null) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref !== null) {
                (ref as RefObject<T | null>).current = value;
            }
        });
    };
}
