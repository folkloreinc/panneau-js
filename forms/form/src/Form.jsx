/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    action: PropTypes.string.isRequired,
    postForm: PropTypes.func,
    type: PropTypes.string,
    fields: PanneauPropTypes.fields.isRequired,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    submitButtonLabel: PanneauPropTypes.message,
    className: PropTypes.string,
};

const defaultProps = {
    type: 'normal',
    postForm: null,
    value: null,
    onChange: null,
    onComplete: null,
    submitButtonLabel: null,
    className: null,
};

const Form = ({
    action,
    type,
    postForm,
    fields: providedFields,
    value: providedValue,
    onChange: parentOnChange,
    onComplete,
    submitButtonLabel,
    className,
    ...props
}) => {
    const FormComponent = useFormComponent(type);
    const defaultPostForm = useCallback(
        (act, data) =>
            postJSON(act, data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
            }),
        [],
    );

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        fields: providedFields,
        postForm: postForm || defaultPostForm,
        onComplete,
        value: providedValue,
        setValue: parentOnChange,
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
