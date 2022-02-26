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
    currentPasswordLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/user/password',
    fields: null,
    size: 'lg',
    currentPasswordLabel: (
        <FormattedMessage defaultMessage="Current password" description="Field label" />
    ),
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
    passwordConfirmationLabel: (
        <FormattedMessage defaultMessage="Confirm your password" description="Field label" />
    ),
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Update password" description="Button label" />
    ),
};

const UpdatePassword = ({
    action,
    fields,
    size,
    currentPasswordLabel,
    passwordLabel,
    passwordConfirmationLabel,
    submitButtonLabel,
    ...props
}) => (
    <Form
        action={action}
        method="PUT"
        fields={
            fields || [
                {
                    name: 'current_password',
                    type: 'password',
                    size,
                    label: currentPasswordLabel,
                },
                {
                    name: 'password',
                    type: 'password',
                    size,
                    label: passwordLabel,
                },
                {
                    name: 'password_confrmation',
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

UpdatePassword.propTypes = propTypes;
UpdatePassword.defaultProps = defaultProps;

export default UpdatePassword;
