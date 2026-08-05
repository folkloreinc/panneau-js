import { FormattedMessage } from 'react-intl';

import type { ControlSize, Field, Label } from '@panneau/core';
import { useFormComponent, useFormDefinition } from '@panneau/core/contexts';
import Link from '@panneau/element-link';

interface LoginProps {
    action?: string;
    postForm?: ((action: string, data: unknown) => Promise<unknown>) | null;
    fields: Field[] | null;
    size?: ControlSize;
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
    size = 'lg',
    submitButtonLabel = null,
    withForgotPassword = false,
    forgotPasswordLink = '/forgot-password',
    forgotPasswordLabel = null,
    ...props
}: LoginProps) {
    const FormComponent = useFormComponent('normal');
    const { fields } = useFormDefinition('login') || {};
    return (
        <FormComponent
            action={action}
            postForm={postForm}
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
            size={size}
            fields={fields || []}
            {...props}
        />
    );
}

export default Login;
