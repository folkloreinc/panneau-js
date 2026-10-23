import type { ComponentType, ReactNode } from 'react';

import type { Field } from '@panneau/protocol';

/**
 * Props of every field component. Fields are controlled: they show `value` and report changes
 * through `onChange`, and keep no value of their own. An empty value is `null`.
 */
export interface FieldProps<V> {
    value?: V | null;
    onChange?: (value: V | null) => void;
    /** Called when the field loses focus: forms show its client errors from then on. */
    onBlur?: () => void;
    /** Error messages. Any message makes the field invalid. */
    errors?: readonly string[];
    disabled?: boolean;
    readOnly?: boolean;
    /** Marks the field as required. Validation itself is the form's job. */
    required?: boolean;
    label?: ReactNode;
    /** Help text under the field. */
    description?: ReactNode;
    /** Name of the field, also used as the name of its input. */
    name?: string;
    id?: string;
    autoFocus?: boolean;
    /** Accessible label, for a field without a visible label. */
    'aria-label'?: string;
    className?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorsClassName?: string;
}

/** Props of a registry entry: a field component driven by a field of the definition. */
export interface FieldEntryProps {
    /** The field, as the definition describes it. */
    field: Field;
    /** Dot path of the value (`blocks.2.title`), unique in the form. */
    path: string;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    errors?: readonly string[];
    disabled?: boolean;
    readOnly?: boolean;
    /** The object the field belongs to: the form's values, or a group or a block. */
    parentValue?: unknown;
    /** The locale of the value: the input of a locale of a localized field. */
    locale?: string;
    className?: string;
}

/** A registry entry: renders the field of a type from its definition. */
export type FieldEntry = ComponentType<FieldEntryProps>;
