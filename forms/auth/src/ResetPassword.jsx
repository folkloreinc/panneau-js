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
    passwordLabel: PanneauPropTypes.message,
    passwordConfirmationLabel: PanneauPropTypes.message,
    submitButtonLabel: PanneauPropTypes.message,
};

const defaultProps = {
    fields: null,
    size: 'lg',
    passwordLabel: <FormattedMessage defaultMessage="Password" description="Field label" />,
    passwordConfirmationLabel: (
        <FormattedMessage defaultMessage="Password confirmation" description="Field label" />
    ),
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Save new password" description="Button label" />
    ),
};

const ResetPassword = ({
    action,
    fields,
    size,
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

ResetPassword.propTypes = propTypes;
ResetPassword.defaultProps = defaultProps;

export default ResetPassword;
