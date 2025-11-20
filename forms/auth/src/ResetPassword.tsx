import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core/types';
import Form from '@panneau/form';

interface ResetPasswordProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    emailLabel?: Label | null;
    passwordLabel?: Label | null;
    passwordConfirmationLabel?: Label | null;
    submitButtonLabel?: Label | null;
}

function ResetPassword({
    action = '/reset-password',
    fields = null,
    size = 'lg',
    emailLabel = null,
    passwordLabel = null,
    passwordConfirmationLabel = null,
    submitButtonLabel = null,
    ...props
}: ResetPasswordProps) {
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
                        readOnly: true,
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
                    <FormattedMessage
                        defaultMessage="Save new password"
                        description="Button label"
                    />
                )
            }
            {...props}
        />
    );
}

export default ResetPassword;
