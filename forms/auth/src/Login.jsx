/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const propTypes = {
    action: PropTypes.string.isRequired,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.message,
    passwordLabel: PanneauPropTypes.message,
};

const defaultProps = {
    fields: null,
    size: 'lg',
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
};

const LoginForm = ({ action, fields, size, emailLabel, passwordLabel, ...props }) => (
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
        submitButtonLabel={<FormattedMessage defaultMessage="Log in" description="Button label" />}
        {...props}
    />
);

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default LoginForm;
