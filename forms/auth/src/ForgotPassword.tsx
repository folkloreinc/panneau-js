/* eslint-disable jsx-a11y/anchor-is-valid */

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core/types';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

interface ForgotPasswordProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    emailLabel?: Label | null;
    submitButtonLabel?: Label | null;
    withLoginLink?: boolean;
    loginLink?: string;
    loginLabel?: Label | null;
}

function ForgotPassword({
    action = '/forgot-password',
    fields = null,
    emailLabel = null,
    submitButtonLabel = null,
    size = 'lg',
    withLoginLink = true,
    loginLink = '/login',
    loginLabel = null,
    ...props
}: ForgotPasswordProps) {
    return (
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
                    },
                ]
            }
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Send reset link" description="Button label" />
                )
            }
            actions={
                withLoginLink ? (
                    <Link href={loginLink} className="py-2 px-4">
                        {loginLabel || (
                            <FormattedMessage
                                defaultMessage="Go back to login"
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

export default ForgotPassword;
