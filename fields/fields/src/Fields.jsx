/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { Fragment, useCallback } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldsComponents, useFieldsManager } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import FormGroup from '@panneau/element-form-group';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fields: PanneauPropTypes.fields,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    horizontal: PropTypes.bool,
    isList: PropTypes.bool,
    disabled: PropTypes.bool,
    hideWithoutValue: PropTypes.bool,
    onChange: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    components: null,
    fields: [],
    value: null,
    horizontal: false,
    isList: false,
    disabled: false,
    hideWithoutValue: false,
    onChange: null,
    className: null,
};

const Fields = ({
    components: providedComponents,
    fields,
    value,
    horizontal: fieldsHorizontal,
    isList,
    hideWithoutValue,
    disabled,
    onChange,
    className,
}) => {
    const fieldsManager = useFieldsManager();
    const contextComponents = useFieldsComponents();
    const components = providedComponents || contextComponents;

    const onFieldChange = useCallback(
        ({ name = null }, newFieldValue) => {
            const newValue =
                name !== null
                    ? {
                          ...value,
                          [name]: newFieldValue,
                      }
                    : {
                          ...value,
                          ...newFieldValue,
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
            isListItem = false,
            siblingFields = [],
            defaultValue = null,
            className: fieldClassName = null,
            groupClassName = null,
            labelClassName = null,
            ...fieldProps
        } = field || {};

        const fieldDefinition = type !== null ? fieldsManager.getDefinition(type) : null;

        const {
            id,
            component: definitionComponent = null,
            ...definitionProps
        } = fieldDefinition || {};

        const FieldComponent = getComponentFromName(component || definitionComponent, components);

        let fieldValue; // To detect if it's truly empty and not null
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
                    name={name}
                    value={fieldValue}
                    item={value}
                    horizontal={horizontal}
                    onChange={(newValue) => onFieldChange(field, newValue)}
                    className={fieldClassName}
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
                        className={classNames([{ 'mb-3': !isListItem }, groupClassName])}
                        labelClassName={classNames([labelClassName])}
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
            className={classNames([
                {
                    fields: true,
                    'list-group': isList,
                    'list-group-horizontal': fieldsHorizontal,
                    [className]: className !== null,
                },
            ])}
        >
            {fieldsHorizontal && !isList ? (
                <div
                    className={classNames({
                        'd-inline-flex flex-row': !isList,
                    })}
                >
                    {content}
                </div>
            ) : (
                content
            )}
        </div>
    );
};

Fields.propTypes = propTypes;
Fields.defaultProps = defaultProps;

export default Fields;
