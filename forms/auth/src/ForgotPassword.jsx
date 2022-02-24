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
    submitButtonLabel: PanneauPropTypes.message,
    withLoginLink: PropTypes.bool,
    loginLink: PropTypes.string,
    loginLabel: PanneauPropTypes.message,
};

const defaultProps = {
    fields: null,
    size: 'lg',
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Send reset link" description="Button label" />
    ),
    withLoginLink: true,
    loginLink: '/login',
    loginLabel: <FormattedMessage defaultMessage="Go back to login" description="Field label" />,
};

const ForgotPassword = ({
    action,
    fields,
    emailLabel,
    submitButtonLabel,
    size,
    withLoginLink,
    loginLink,
    loginLabel,
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
                },
            ]
        }
        submitButtonLabel={submitButtonLabel}
        actions={
            withLoginLink ? (
                <a className="py-2 px-5" href={loginLink}>
                    {loginLabel}
                </a>
            ) : null
        }
        {...props}
    />
);

ForgotPassword.propTypes = propTypes;
ForgotPassword.defaultProps = defaultProps;

export default ForgotPassword;
