import { type Field, evaluateCondition } from '@panneau/protocol';

// Localized values render nested fields, which render through `DefinitionField`: the modules
// import each other, which is fine since they only use each other while rendering.
import { LocalizedFieldEntry } from '../localized/LocalizedField';
import { MissingFieldEntry } from '../missing/MissingField';
import { getParentPath, useFieldsContext } from './context';
import type { FieldEntryProps } from './types';

export interface NestedFieldProps {
    field: Field;
    /** Dot path of the field's value. */
    path: string;
    /** The value, without a binding. */
    value?: unknown;
    /** Sets the value, without a binding. */
    onChange?: (value: unknown) => void;
    onBlur?: () => void;
    errors?: readonly string[];
    /** The object the field belongs to, for conditions and generated values. */
    parentValue?: unknown;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
}

/**
 * A field inside another one (a group, a block, a localized value), or at the top of a form.
 * With a binding in context, the binding gives its value and decides whether it shows. Without
 * one, it uses `value` and `onChange`, and hides itself when its `visibleWhen` condition on the
 * parent value is false.
 */
export function NestedField({
    field,
    path,
    value,
    onChange,
    onBlur,
    errors,
    parentValue,
    disabled,
    readOnly,
    className,
}: NestedFieldProps) {
    const { binding: Binding } = useFieldsContext();
    const shared = {
        field,
        path,
        parentValue,
        ...(disabled !== undefined ? { disabled } : {}),
        ...(readOnly !== undefined ? { readOnly } : {}),
        ...(className !== undefined ? { className } : {}),
    };
    if (Binding !== null) {
        return (
            <Binding
                field={field}
                path={path}
                parentPath={getParentPath(path)}
                render={(bound) => <DefinitionField {...shared} {...bound} />}
            />
        );
    }
    if (field.visibleWhen !== undefined && !evaluateCondition(field.visibleWhen, parentValue)) {
        return null;
    }
    return (
        <DefinitionField
            {...shared}
            value={value}
            onChange={onChange ?? (() => undefined)}
            {...(onBlur !== undefined ? { onBlur } : {})}
            {...(errors !== undefined ? { errors } : {})}
        />
    );
}

/**
 * Renders a field of the definition with the entry of its type, from the fields context. A
 * localized field renders an input per locale. A type without an entry renders a placeholder
 * that names the missing plugin.
 */
export function DefinitionField(props: FieldEntryProps) {
    const { components } = useFieldsContext();
    const { field } = props;
    if (field.localized === true) {
        return <LocalizedFieldEntry {...props} />;
    }
    const Entry = components[field.type] ?? MissingFieldEntry;
    return <Entry {...props} />;
}
