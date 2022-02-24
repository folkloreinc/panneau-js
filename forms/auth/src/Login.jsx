/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withForgotPassword: PropTypes.bool,
    forgotPasswordLink: PropTypes.string,
    forgotPasswordLabel: PanneauPropTypes.label,
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
                <Link className="py-2 px-5" to={forgotPasswordLink}>
                    {forgotPasswordLabel}
                </Link>
            ) : null
        }
        {...props}
    />
);

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
