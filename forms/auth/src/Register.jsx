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
    fields: PanneauPropTypes.fields,
    size: PropTypes.string,
    nameLabel: PanneauPropTypes.label,
    emailLabel: PanneauPropTypes.label,
    passwordLabel: PanneauPropTypes.label,
    passwordConfirmationLabel: PanneauPropTypes.label,
    submitButtonLabel: PanneauPropTypes.label,
    withLoginLink: PropTypes.bool,
    loginLink: PropTypes.string,
    loginLabel: PanneauPropTypes.label,
};

function Register({
    action = '/register',
    fields = null,
    size = 'lg',
    nameLabel = null,
    emailLabel = null,
    passwordLabel = null,
    passwordConfirmationLabel = null,
    submitButtonLabel = null,
    withLoginLink = true,
    loginLink = '/login',
    loginLabel = null,
    ...props
}) {
    return (
        <Form
            action={action}
            fields={
                fields || [
                    {
                        name: 'name',
                        type: 'text',
                        size,
                        label: nameLabel || (
                            <FormattedMessage defaultMessage="Name" description="Field label" />
                        ),
                    },
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
                    <FormattedMessage defaultMessage="Create account" description="Button label" />
                )
            }
            actions={
                withLoginLink ? (
                    <Link href={loginLink} className="py-2 px-4">
                        {loginLabel || (
                            <FormattedMessage
                                defaultMessage="Already have an account? Go to login"
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

Register.propTypes = propTypes;

export default Register;
