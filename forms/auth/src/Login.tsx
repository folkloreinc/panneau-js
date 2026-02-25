/* eslint-disable jsx-a11y/anchor-is-valid */
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

interface LoginProps {
    action?: string;
    postForm?: ((action: string, data: unknown) => Promise<unknown>) | null;
    fields?: Field[] | null;
    size?: string;
    emailLabel?: Label | null;
    passwordLabel?: Label | null;
    submitButtonLabel?: Label | null;
    withForgotPassword?: boolean;
    forgotPasswordLink?: string;
    forgotPasswordLabel?: Label | null;
}

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
}: LoginProps) {
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

export default Login;
