/* eslint-disable jsx-a11y/anchor-is-valid */

/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

const propTypes = {
    action: PropTypes.string,
    postForm: PropTypes.func,
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withForgotPassword: PropTypes.bool,
    forgotPasswordLink: PropTypes.string,
    forgotPasswordLabel: PanneauPropTypes.label,
};

function Login({
    action = '/login',
    postForm = null,
    fields = null,
    size = 'lg',
    emailLabel = null,
    passwordLabel = null,
    submitButtonLabel = null,
    withForgotPassword = false,
    forgotPasswordLink = '/forgot-password',
    forgotPasswordLabel = null,
    ...props
}) {
    return (
        <Form
            action={action}
            postForm={postForm}
            fields={
                fields || [
                    {
                        name: 'email',
                        type: 'email',
                        size,
                        label: emailLabel || (
                            <FormattedMessage defaultMessage="Email" description="Field label" />
                        ),
                    },
                    {
                        name: 'password',
                        type: 'password',
                        size,
                        label: passwordLabel || (
                            <FormattedMessage defaultMessage="Password" description="Field label" />
                        ),
                    },
                ]
            }
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Log in" description="Button label" />
                )
            }
            actions={
                withForgotPassword ? (
                    <Link href={forgotPasswordLink} className="py-2 px-4">
                        {forgotPasswordLabel || (
                            <FormattedMessage
                                defaultMessage="Forgot your password?"
                                description="Link label"
                            />
                        )}
                    </Link>
                ) : null
            }
            {...props}
        />
    );
}

Login.propTypes = propTypes;

export default Login;
