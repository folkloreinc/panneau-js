/* eslint-disable react/jsx-props-no-spreading */
import { useAuth } from '@panneau/auth';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFormComponent, useUrlGenerator } from '@panneau/core/contexts';
import { useForm } from '@panneau/core/hooks';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    fields: PanneauPropTypes.fields,
    className: PropTypes.string,
    onSuccess: PropTypes.func,
};

const defaultProps = {
    fields: [
        {
            name: 'email',
            type: 'email',
            size: 'lg',
            label: <FormattedMessage defaultMessage="Email" description="Field label" />,
        },
        {
            name: 'password',
            type: 'password',
            size: 'lg',
            label: <FormattedMessage defaultMessage="Password" description="Field label" />,
        },
    ],
    className: null,
    onSuccess: null,
};

const LoginForm = ({ fields: formFields, className, onSuccess }) => {
    const url = useUrlGenerator();
    const { login } = useAuth();
    const postForm = useCallback((action, { email, password }) => login(email, password), [login]);

    const { value, setValue, fields, onSubmit, status, generalError, errors } = useForm({
        fields: formFields,
        postForm,
        onComplete: onSuccess,
    });

    const NormalForm = useFormComponent('normal');

    return (
        <NormalForm
            action={url('auth.login')}
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
                <FormattedMessage defaultMessage="Log in" description="Button label" />
            }
        />
    );
};

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
