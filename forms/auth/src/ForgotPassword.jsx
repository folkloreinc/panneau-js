/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Form from '@panneau/form';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const propTypes = {
    action: PropTypes.string,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withLoginLink: PropTypes.bool,
    loginLink: PropTypes.string,
    loginLabel: PanneauPropTypes.label,
};

const defaultProps = {
    action: '/forgot-password',
    fields: null,
    size: 'lg',
    emailLabel: <FormattedMessage defaultMessage="Email" description="Field label" />,
    submitButtonLabel: (
        <FormattedMessage defaultMessage="Send reset link" description="Button label" />
    ),
    withLoginLink: true,
    loginLink: '/login',
    loginLabel: <FormattedMessage defaultMessage="Go back to login" description="Link label" />,
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
                <Link className="py-2 px-4" to={loginLink}>
                    {loginLabel}
                </Link>
            ) : null
        }
        {...props}
    />
);

ForgotPassword.propTypes = propTypes;
ForgotPassword.defaultProps = defaultProps;

export default ForgotPassword;
