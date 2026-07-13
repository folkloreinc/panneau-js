import classNames from 'classnames';
import get from 'lodash-es/get';
import type { ComponentType } from 'react';
import { Fragment, useCallback } from 'react';

import type { ControlSize, Field } from '@panneau/core';
import { useFieldsComponents, useFieldsManager } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import FormGroup from '@panneau/element-form-group';

interface FieldsProps {
    components?: Record<string, ComponentType> | null;
    fields?: Field[];
    value?: Record<string, unknown> | null;
    horizontal?: boolean;
    isList?: boolean;
    disabled?: boolean;
    size?: ControlSize;
    hideWithoutValue?: boolean;
    onChange?: ((value: Record<string, unknown>) => void) | null;
    className?: string | null;
    horizontalClassName?: string | null;
    fieldClassName?: string | null;
    fieldGroupClassName?: string | null;
    fieldLabelClassName?: string | null;
}

const DEFAULT_FIELDS: Field[] = [];

function Fields({
    components: providedComponents = null,
    fields = DEFAULT_FIELDS,
    value = null,
    horizontal: fieldsHorizontal = false,
    isList = false,
    hideWithoutValue = false,
    disabled = false,
    size = null,
    onChange = null,
    className = null,
    horizontalClassName = null,
    fieldClassName = null,
    fieldGroupClassName = null,
    fieldLabelClassName = null,
}: FieldsProps) {
    const fieldsManager = useFieldsManager();
    const contextComponents = useFieldsComponents();
    const components = providedComponents || contextComponents;

    const onFieldChange = useCallback(
        ({ name = null }: { name?: string | null }, newFieldValue: unknown) => {
            const newValue =
                name !== null
                    ? {
                          ...value,
                          [name]: newFieldValue,
                      }
                    : {
                          ...value,
                          ...(newFieldValue as Record<string, unknown>),
                      };
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, value],
    );

    const content = (fields || []).map((field, index) => {
        const {
            type = null,
            component = null,
            name = null,
            horizontal = false,
            inline = false,
            withoutFormGroup = false,
            isListItem = isList,
            siblingFields = DEFAULT_FIELDS,
            defaultValue = null,
            className: customFieldClassName = null,
            groupClassName: customGroupClassName = null,
            labelClassName: customLabelClassName = null,
            size: customSize = null,
            ...fieldProps
        } = (field || {}) as Field & {
            horizontal?: boolean;
            inline?: boolean;
            withoutFormGroup?: boolean;
            isListItem?: boolean;
            siblingFields?: Field[];
            defaultValue?: unknown;
            className?: string | null;
            groupClassName?: string | null;
            labelClassName?: string | null;
        };

        const fieldDefinition = type !== null ? fieldsManager.getDefinition(type) : null;

        const {
            id,
            component: definitionComponent = null,
            size: definitionSize = null,
            ...definitionProps
        } = (fieldDefinition || {}) as {
            id?: string;
            component?: string;
            [key: string]: unknown;
        };

        const FieldComponent = getComponentFromName(component || definitionComponent, components);

        let fieldValue: unknown; // To detect if it's truly empty and not null
        if (value !== null && name !== null) {
            fieldValue = get(value, name, null);
        } else if (name === null) {
            fieldValue = value;
        }

        if (name !== null && fieldValue === null && hideWithoutValue) {
            return null;
        }

        if (defaultValue !== null && typeof fieldValue === 'undefined') {
            fieldValue = defaultValue;
        }

        const fieldElement =
            FieldComponent !== null ? (
                <FieldComponent
                    {...definitionProps}
                    disabled={disabled === true}
                    {...fieldProps}
                    size={size ?? customSize ?? definitionSize}
                    inline={inline}
                    name={name}
                    value={fieldValue}
                    horizontal={horizontal}
                    onChange={(newValue: unknown) => onFieldChange(field, newValue)}
                    className={classNames([fieldClassName, customFieldClassName])}
                />
            ) : null;

        return (
            <Fragment key={`field-${name || index}-${index + 1}`}>
                {!withoutFormGroup && fieldElement !== null ? (
                    <FormGroup
                        key={`field-${name || index}`}
                        {...definitionProps}
                        {...fieldProps}
                        horizontal={horizontal}
                        inline={inline}
                        isListItem={isListItem}
                        className={classNames([
                            { 'mb-3': !isListItem },
                            fieldGroupClassName,
                            customGroupClassName,
                        ])}
                        labelClassName={classNames([fieldLabelClassName, customLabelClassName])}
                    >
                        {fieldElement}
                    </FormGroup>
                ) : (
                    fieldElement
                )}
                {siblingFields !== null && siblingFields.length > 0 ? (
                    <Fields fields={siblingFields} value={value} onChange={onChange} />
                ) : null}
            </Fragment>
        );
    });

    return (
        <div
            className={classNames('fields', [
                {
                    'list-group': isList,
                    'list-group-horizontal': fieldsHorizontal,
                },
                className,
            ])}
        >
            {fieldsHorizontal && !isList ? (
                <div
                    className={classNames([
                        {
                            'd-inline-flex flex-row': !isList,
                        },
                        horizontalClassName,
                    ])}
                >
                    {content}
                </div>
            ) : (
                content
            )}
        </div>
    );
}

export default Fields;
