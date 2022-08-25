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
    codeLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/two-factor-challenge',
    fields: null,
    size: 'lg',
    codeLabel: (
        <FormattedMessage
            defaultMessage="Enter the code from your authenticator app to continue"
            description="Field label"
        />
    ),
    submitButtonLabel: <FormattedMessage defaultMessage="Continue" description="Button label" />,
};

const TwoFactorChallenge = ({ action, fields, size, codeLabel, submitButtonLabel, ...props }) => (
    <Form
        action={action}
        fields={
            fields || [
                {
                    name: 'code',
                    type: 'text',
                    size,
                    label: codeLabel,
                },
            ]
        }
        submitButtonLabel={submitButtonLabel}
        {...props}
    />
);

TwoFactorChallenge.propTypes = propTypes;
TwoFactorChallenge.defaultProps = defaultProps;

export default TwoFactorChallenge;
