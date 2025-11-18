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
    currentPasswordLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

function ChangePassword({
    action = '/user/password',
    fields = null,
    size = 'lg',
    currentPasswordLabel = null,
    passwordLabel = null,
    passwordConfirmationLabel = null,
    submitButtonLabel = null,
    ...props
}) {
    return (
        <Form
            action={action}
            method="PUT"
            fields={
                fields || [
                    {
                        name: 'current_password',
                        type: 'password',
                        size,
                        label: currentPasswordLabel || (
                            <FormattedMessage
                                defaultMessage="Current password"
                                description="Field label"
                            />
                        ),
                    },
                    {
                        name: 'password',
                        type: 'password',
                        size,
                        label: passwordLabel || (
                            <FormattedMessage defaultMessage="New password" description="Field label" />
                        ),
                    },
                    {
                        name: 'password_confirmation',
                        type: 'password',
                        size,
                        label: passwordConfirmationLabel || (
                            <FormattedMessage
                                defaultMessage="Confirm your new password"
                                description="Field label"
                            />
                        ),
                    },
                ]
            }
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Update password" description="Button label" />
                )
            }
            {...props}
        />
    );
}

ChangePassword.propTypes = propTypes;

export default ChangePassword;
