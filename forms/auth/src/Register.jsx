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
    nameLabel: PanneauPropTypes.label,
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withLoginLink: PropTypes.bool,
    loginLink: PropTypes.string,
    loginLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/register',
    fields: null,
    size: 'lg',
    nameLabel: <FormattedMessage defaultMessage="Name" description="Field label" />,
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
    passwordConfirmationLabel: (
        <FormattedMessage defaultMessage="Confirm your password" description="Field label" />
    ),
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Create account" description="Button label" />
    ),
    withLoginLink: true,
    loginLink: '/login',
    loginLabel: (
        <FormattedMessage
            defaultMessage="Already have an account? Go to login"
            description="Link label"
        />
    ),
};

const Register = ({
    action,
    fields,
    size,
    nameLabel,
    emailLabel,
    passwordLabel,
    passwordConfirmationLabel,
    submitButtonLabel,
    withLoginLink,
    loginLink,
    loginLabel,
    ...props
}) => (
    <Form
        action={action}
        fields={
            fields || [
                {
                    name: 'name',
                    type: 'text',
                    size,
                    label: nameLabel,
                },
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
                {
                    name: 'password_confirmation',
                    type: 'password',
                    size,
                    label: passwordConfirmationLabel,
                },
            ]
        }
        submitButtonLabel={submitButtonLabel}
        actions={
            withLoginLink ? (
                <Link className="py-2 px-4" to={loginLink}>
                    {loginLabel}
                </Link>
            ) : null
        }
        {...props}
    />
);

Register.propTypes = propTypes;
Register.defaultProps = defaultProps;

export default Register;
