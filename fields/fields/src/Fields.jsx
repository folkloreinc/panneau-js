/* eslint-disable react/jsx-props-no-spreading */
import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName, getDefinitionFromId } from '@panneau/core/utils';
import { useFieldsComponents, useFieldDefinitions } from '@panneau/core/contexts';
import FormGroup from '@panneau/element-form-group';
import FormRow from '@panneau/element-form-row';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    definitions: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    fields: PanneauPropTypes.fields,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    row: PropTypes.bool,
    // columns: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    components: null,
    definitions: null,
    fields: [],
    value: null,
    row: false,
    // columns: false,
    className: null,
    onChange: null,
};

const Fields = ({
    components: parentComponents,
    definitions: parentDefinitions,
    fields,
    value,
    row,
    // columns,
    onChange,
    className,
}) => {
    const contextComponents = useFieldsComponents();
    const contextDefinitions = useFieldDefinitions();
    const components = parentComponents || contextComponents;
    const definitions = parentDefinitions || contextDefinitions;

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

    const content = fields.map((field, index) => {
        const {
            type = null,
            component = null,
            name = null,
            horizontal = false,
            without_form_group: withoutFormGroup = false,
            sibling_fields: siblingFields = [],
            classname = null,
            group_classname: groupClassName = null,
            label_classname: labelClassName = null,
            check: fieldCheck = false,
        } = field;

        const FieldComponent = getComponentFromName(type, components, component);
        const definition = getDefinitionFromId(type, definitions, null);
        const { check: definitionCheck = false } = definition || {};

        let fieldValue = null;
        if (value !== null && name !== null) {
            fieldValue = value[name];
        } else if (name === null) {
            fieldValue = value;
        }
        const fieldElement =
            FieldComponent !== null ? (
                <FieldComponent
                    {...field}
                    value={fieldValue}
                    onChange={(newValue) => onFieldChange(field, newValue)}
                    className={classNames([classname])}
                />
            ) : null;
        const column = row === true;
        const check = fieldCheck || definitionCheck;

        return (
            <Fragment key={`field-${name || index}-${index + 1}`}>
                {!withoutFormGroup && fieldElement !== null ? (
                    <FormGroup
                        key={`field-${name || index}`}
                        {...field}
                        horizontal={horizontal}
                        column={column}
                        check={check}
                        className={classNames([groupClassName])}
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
                    [className]: className !== null,
                },
            ])}
        >
            {row ? <FormRow>{content}</FormRow> : content}
        </div>
    );
};

Fields.propTypes = propTypes;
Fields.defaultProps = defaultProps;

export default Fields;
