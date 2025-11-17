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
    passwordLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const ConfirmPassword = ({
    action = '/user/confirm-password',
    fields = null,
    size = 'lg',
    passwordLabel = null,
    submitButtonLabel = null,
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
                    label: passwordLabel || (
                        <FormattedMessage
                            defaultMessage="Please enter your password to continue"
                            description="Field label"
                        />
                    ),
                },
            ]
        }
        submitButtonLabel={
            submitButtonLabel || (
                <FormattedMessage defaultMessage="Continue" description="Button label" />
            )
        }
        {...props}
    />
);

ConfirmPassword.propTypes = propTypes;

export default ConfirmPassword;
