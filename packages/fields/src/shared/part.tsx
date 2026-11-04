import type { ReactNode } from 'react';

import type { Field } from '@panneau/protocol';

import { getParentPath, useFieldsContext } from './context';

/** What a part of a value gets from the binding of the fields context: its errors and its blur. */
export interface BoundPartProps {
    errors?: readonly string[];
    onBlur?: () => void;
}

export interface PartBindingProps {
    /** The part, as a field of the definition: the binding reads its errors by its path. */
    field: Field;
    /** Dot path of the part (`address.postalCode`). */
    path: string;
    /** Errors of the part without a binding. */
    errors?: readonly string[];
    /** Blur of the part without a binding. */
    onBlur?: () => void;
    render: (bound: BoundPartProps) => ReactNode;
}

/**
 * A part of a value that a field edits itself (the postal code of an address, the URL of a link):
 * the field keeps its whole value, and the binding of the fields context gives each part the
 * errors of its own path, and marks it touched when it loses focus. Without a binding, the part
 * gets `errors` and `onBlur`.
 */
export function BoundPart({ field, path, errors, onBlur, render }: PartBindingProps) {
    const { binding: Binding } = useFieldsContext();
    if (Binding === null) {
        return render({
            ...(errors !== undefined ? { errors } : {}),
            ...(onBlur !== undefined ? { onBlur } : {}),
        });
    }
    return (
        <Binding
            field={field}
            path={path}
            parentPath={getParentPath(path)}
            render={(bound) =>
                render({
                    ...(bound.errors !== undefined ? { errors: bound.errors } : {}),
                    ...(bound.onBlur !== undefined ? { onBlur: bound.onBlur } : {}),
                })
            }
        />
    );
}
