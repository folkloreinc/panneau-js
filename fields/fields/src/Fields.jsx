/* eslint-disable react/jsx-props-no-spreading */
import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';
import { useFieldsComponents } from '@panneau/core/contexts';
import FormGroup from '@panneau/element-form-group';
import FormRow from '@panneau/element-form-row';

const propTypes = {
    components: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fields: PanneauPropTypes.fields,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    horizontal: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    components: null,
    fields: [],
    value: null,
    horizontal: false,
    className: null,
    onChange: null,
};

const Fields = ({
    components: parentComponents,
    fields,
    value,
    horizontal: fieldsHorizontal,
    onChange,
    className,
}) => {
    const contextComponents = useFieldsComponents();
    const components = parentComponents || contextComponents;

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
            component = null,
            name = null,
            horizontal = false,
            inline = false,
            // TODO: test this
            withoutFormGroup = false,
            siblingFields = [],
            classname = null,
            groupClassName = null,
            labelClassName = null,
            check: fieldCheck = false,
        } = field || {};

        const FieldComponent = getComponentFromName(component, components, component);

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
        const check = fieldCheck;

        return (
            <Fragment key={`field-${name || index}-${index + 1}`}>
                {!withoutFormGroup && fieldElement !== null ? (
                    <FormGroup
                        key={`field-${name || index}`}
                        {...field}
                        horizontal={horizontal}
                        inline={inline}
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
            {fieldsHorizontal ? <FormRow>{content}</FormRow> : content}
        </div>
    );
};

Fields.propTypes = propTypes;
Fields.defaultProps = defaultProps;

export default Fields;
