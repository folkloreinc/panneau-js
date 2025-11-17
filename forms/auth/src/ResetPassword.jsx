/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const ResetPassword = ({
    action = '/reset-password',
    fields = null,
    size = 'lg',
    emailLabel = null,
    passwordLabel = null,
    passwordConfirmationLabel = null,
    submitButtonLabel = null,
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
                    label: emailLabel || (
                        <FormattedMessage defaultMessage="Email" description="Field label" />
                    ),
                    readOnly: true,
                },
                {
                    name: 'password',
                    type: 'password',
                    size,
                    label: passwordLabel || (
                        <FormattedMessage defaultMessage="Password" description="Field label" />
                    ),
                },
                {
                    name: 'password_confirmation',
                    type: 'password',
                    size,
                    label: passwordConfirmationLabel || (
                        <FormattedMessage
                            defaultMessage="Confirm your password"
                            description="Field label"
                        />
                    ),
                },
            ]
        }
        submitButtonLabel={
            submitButtonLabel || (
                <FormattedMessage defaultMessage="Save new password" description="Button label" />
            )
        }
        {...props}
    />
);

ResetPassword.propTypes = propTypes;

export default ResetPassword;
