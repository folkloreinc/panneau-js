import type { ReactNode } from 'react';

import type { Field } from '@panneau/protocol';
import { Fieldset } from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { cx } from '../shared/cx';
import { getFieldProps } from '../shared/entry';
import { isWideField } from '../shared/flow';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './GroupField.module.css';

export type GroupValue = Record<string, unknown>;

export interface GroupFieldProps extends FieldProps<GroupValue> {
    /** The nested fields, rendered with the entries of the fields context. */
    fields: readonly Field[];
    /** Dot path of the group's value, the prefix of its fields' paths. Defaults to `name`. */
    path?: string;
    /**
     * Lays out the rendered fields, by name, instead of the flow of short fields side by side:
     * the layout of a compound field (decision 0065).
     */
    renderFields?: (parts: Readonly<Record<string, ReactNode>>, value: GroupValue) => ReactNode;
    fieldsClassName?: string;
}

/**
 * A nested object: its fields under a legend, short ones side by side (`isWideField()`). Each
 * field renders with the entry of its type, at the path `<group>.<field>`. Without a binding in the fields context, the group sets the whole
 * object through `onChange`.
 */
export function GroupField({
    fields,
    path,
    name,
    value,
    onChange,
    onBlur,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    renderFields,
    fieldsClassName,
}: GroupFieldProps) {
    const base = path ?? name ?? '';
    const object = value ?? {};
    const renderField = (field: Field) => (
        <NestedField
            field={field}
            path={base !== '' ? `${base}.${field.name}` : field.name}
            value={object[field.name]}
            onChange={(next) => onChange?.({ ...object, [field.name]: next })}
            {...(onBlur !== undefined ? { onBlur } : {})}
            parentValue={object}
            {...(disabled !== undefined ? { disabled } : {})}
            {...(readOnly !== undefined ? { readOnly } : {})}
        />
    );
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            <div className={cx(styles.fields, fieldsClassName)}>
                {renderFields !== undefined ? (
                    renderFields(
                        Object.fromEntries(fields.map((field) => [field.name, renderField(field)])),
                        object,
                    )
                ) : (
                    <div className={styles.flow}>
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={cx(styles.cell, isWideField(field) && styles.wide)}
                            >
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Fieldset>
    );
}

/** The `group` type: its `fields`, as a nested object. */
export function GroupFieldEntry(props: FieldEntryProps) {
    const { value } = props;
    return (
        <GroupField
            {...getFieldProps(props)}
            fields={props.field.fields ?? []}
            path={props.path}
            value={
                value !== null && typeof value === 'object' && !Array.isArray(value)
                    ? (value as GroupValue)
                    : null
            }
            onChange={props.onChange}
        />
    );
}
