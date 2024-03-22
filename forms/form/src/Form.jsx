/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';

const propTypes = {
    action: PropTypes.string.isRequired,
    method: PropTypes.string,
    postForm: PropTypes.func,
    postOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    postData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string,
    fields: PanneauPropTypes.fields.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    submitButtonLabel: PanneauPropTypes.label,
    useFormProps: PropTypes.shape({}),
    className: PropTypes.string,
};

const defaultProps = {
    type: 'normal',
    method: null,
    postForm: null,
    postOptions: null,
    postData: null,
    value: null,
    onChange: null,
    onComplete: null,
    submitButtonLabel: null,
    useFormProps: null,
    className: null,
};

const Form = ({
    action,
    method,
    type,
    postForm,
    postOptions,
    postData,
    fields: providedFields,
    value: providedValue,
    onChange: parentOnChange,
    onComplete,
    submitButtonLabel,
    useFormProps,
    className,
    ...props
}) => {
    const FormComponent = useFormComponent(type);

    const defaultPostForm = useCallback(
        (act, data) =>
            postJSON(act, postData !== null ? { ...postData, ...data } : data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
                ...(method !== null ? { method } : null),
                ...(postOptions !== null ? postOptions : null),
            }),
        [method, postOptions, postData],
    );

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        action,
        fields: providedFields,
        postForm: postForm || defaultPostForm,
        onComplete,
        value: providedValue,
        setValue: parentOnChange,
        ...useFormProps,
    });

    return (
        <FormComponent
            {...props}
            action={action}
            method="post"
            fields={fields}
            onSubmit={onSubmit}
            className={className}
            status={status}
            generalError={generalError}
            errors={errors}
            value={value}
            onChange={setValue}
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Save" description="Button label" />
                )
            }
        />
    );
};

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
