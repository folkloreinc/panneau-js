/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.message,
    passwordLabel: PanneauPropTypes.message,
    submitButtonLabel: PanneauPropTypes.message,
    withForgotPassword: PropTypes.bool,
    forgotPasswordLink: PropTypes.string,
    forgotPasswordLabel: PanneauPropTypes.message,
};

const defaultProps = {
    action: '/login',
    fields: null,
    size: 'lg',
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
    submitButtonLabel: <FormattedMessage defaultMessage="Log in" description="Button label" />,
    withForgotPassword: true,
    forgotPasswordLink: '/forgot-password',
    forgotPasswordLabel: (
        <FormattedMessage defaultMessage="Forgot your password?" description="Field label" />
    ),
};

const LoginForm = ({
    action,
    fields,
    size,
    emailLabel,
    passwordLabel,
    submitButtonLabel,
    withForgotPassword,
    forgotPasswordLink,
    forgotPasswordLabel,
    ...props
}) => (
    <Form
        action={action}
        fields={
            fields || [
                {
                    name: 'email',
                    type: 'email',
                    size,
                    label: emailLabel,
                },
                {
                    name: 'password',
                    type: 'password',
                    size,
                    label: passwordLabel,
                },
            ]
        }
        submitButtonLabel={submitButtonLabel}
        actions={
            withForgotPassword ? (
                <a className="py-2 px-5" href={forgotPasswordLink}>
                    {forgotPasswordLabel}
                </a>
            ) : null
        }
        {...props}
    />
);

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
