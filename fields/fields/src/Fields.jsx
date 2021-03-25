/* eslint-disable react/jsx-props-no-spreading */
import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';
import FormGroup from '@panneau/element-form-group';

const propTypes = {
    FieldComponents: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    fields: PanneauPropTypes.fields,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    FieldComponents: {},
    fields: [],
    value: null,
    className: null,
    onChange: null,
};

const Fields = ({ FieldComponents, fields, value, onChange, className }) => {
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
    return (
        <div
            className={classNames([
                {
                    [className]: className !== null,
                },
            ])}
        >
            {fields.map((field, index) => {
                const {
                    component,
                    name = null,
                    without_form_group: withoutFormGroup = false,
                    sibbling_fields: sibblingFields = [],
                } = field;
                const FieldComponent = getComponentFromName(FieldComponents, component);
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
                        />
                    ) : null;
                return (
                    <Fragment key={`field-${name || index}`}>
                        {!withoutFormGroup && fieldElement !== null ? (
                            <FormGroup key={`field-${name || index}`} {...field}>
                                {fieldElement}
                            </FormGroup>
                        ) : (
                            fieldElement
                        )}
                        {sibblingFields !== null && sibblingFields.length > 0 ? (
                            <Fields fields={sibblingFields} value={value} onChange={onChange} />
                        ) : null}
                    </Fragment>
                );
            })}
        </div>
    );
};

Fields.propTypes = propTypes;
Fields.defaultProps = defaultProps;

export default Fields;
