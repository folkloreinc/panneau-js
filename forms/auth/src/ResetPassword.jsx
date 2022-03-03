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
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/reset-password',
    fields: null,
    size: 'lg',
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
    passwordConfirmationLabel: (
        <FormattedMessage defaultMessage="Confirm your password" description="Field label" />
    ),
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Save new password" description="Button label" />
    ),
};

const ResetPassword = ({
    action,
    fields,
    size,
    emailLabel,
    passwordLabel,
    passwordConfirmationLabel,
    submitButtonLabel,
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
                    readOnly: true,
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
        {...props}
    />
);

ResetPassword.propTypes = propTypes;
ResetPassword.defaultProps = defaultProps;

export default ResetPassword;
