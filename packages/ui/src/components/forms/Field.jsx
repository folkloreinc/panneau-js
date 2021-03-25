/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { PropTypes as PanneauPropTypes } from '../../lib';
import { getComponentFromName, setFieldValue, getFieldFromPath } from '../../utils';
import { useFieldsManager, useFieldComponent } from '../../contexts';

const propTypes = {
    name: PropTypes.string, // .isRequired,
    value: PanneauPropTypes.component,
    form: PropTypes.string,
    formComponents: PanneauPropTypes.components,
    fields: PanneauPropTypes.fields,
    className: PropTypes.string,
    onChange: PropTypes.func,
    gotoFieldForm: PropTypes.func.isRequired,
    closeFieldForm: PropTypes.func.isRequired,
};

const defaultProps = {
    name: null,
    form: null,
    formComponents: {},
    fields: [],
    value: null,
    className: null,
    onChange: null,
};

const FieldForm = ({
    name,
    value,
    form,
    formComponents,
    fields,
    className,
    onChange,
    gotoFieldForm,
    closeFieldForm,
}) => {
    const fieldsManager = useFieldsManager();

    const field = getFieldFromPath(name.split('.'), fields, fieldsManager);

    const { type = null, ...fieldProps } = field || {};
    const { component: fieldComponent = null, id, settings, ...definitionProps } = (type !== null
        ? fieldsManager.getDefinition(type) || null
        : null) || {
        ...field,
    };
    const FieldComponent = useFieldComponent(fieldComponent);

    const fieldValue = get(value, name, null);

    const onFieldChange = useCallback(
        (newFieldValue) => {
            // const { name, fields: subFields = null } = field || {};
            const newValue = setFieldValue(
                value,
                name.split('.'),
                newFieldValue,
                // field === null || subFields !== null ? newFieldValue : newFieldValue[name],
            );
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [value, name, onChange],
    );

    const closeForm = useCallback(() => closeFieldForm(name, form), [name, form, closeFieldForm]);

    const formProps = {
        name,
        value: fieldValue,
        onChange: onFieldChange,
        gotoFieldForm,
        closeFieldForm,
        closeForm,
    };

    if (form !== null) {
        const FormComponent = getComponentFromName(form, formComponents);
        return FormComponent !== null ? (
            <FormComponent field={field} {...formProps} className={className} />
        ) : null;
    }

    // Use field component with isForm props
    return FieldComponent !== null ? (
        <FieldComponent
            className={className}
            {...definitionProps}
            {...fieldProps}
            isForm
            {...formProps}
        />
    ) : null;
};

FieldForm.propTypes = propTypes;
FieldForm.defaultProps = defaultProps;

export default FieldForm;
