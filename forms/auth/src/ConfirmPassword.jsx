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
    passwordLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/user/confirm-password',
    fields: null,
    size: 'lg',
    passwordLabel: (
        <FormattedMessage
            defaultMessage="Please enter your password to continue"
            description="Field label"
        />
    ),
    submitButtonLabel: <FormattedMessage defaultMessage="Continue" description="Button label" />,
};

const ConfirmPassword = ({ action, fields, size, passwordLabel, submitButtonLabel, ...props }) => (
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
            ]
        }
        submitButtonLabel={submitButtonLabel}
        {...props}
    />
);

ConfirmPassword.propTypes = propTypes;
ConfirmPassword.defaultProps = defaultProps;

export default ConfirmPassword;
