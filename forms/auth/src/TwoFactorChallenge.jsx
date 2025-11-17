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
    codeLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
};

const TwoFactorChallenge = ({
    action = '/two-factor-challenge',
    fields = null,
    size = 'lg',
    codeLabel = null,
    submitButtonLabel = null,
    ...props
}) => (
    <Form
        action={action}
        fields={
            fields || [
                {
                    name: 'code',
                    type: 'text',
                    size,
                    label: codeLabel || (
                        <FormattedMessage
                            defaultMessage="Enter the code from your authenticator app to continue"
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

TwoFactorChallenge.propTypes = propTypes;

export default TwoFactorChallenge;
