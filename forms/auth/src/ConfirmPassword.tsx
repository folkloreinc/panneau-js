/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core/types';
import Form from '@panneau/form';

interface ConfirmPasswordProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    passwordLabel?: Label | null;
    submitButtonLabel?: Label | null;
}

function ConfirmPassword({
    action = '/user/confirm-password',
    fields = null,
    size = 'lg',
    passwordLabel = null,
    submitButtonLabel = null,
    ...props
}: ConfirmPasswordProps) {
    return (
        <Form
            action={action}
            fields={
                fields || [
                    {
                        name: 'password',
                        type: 'password',
                        size,
                        label: passwordLabel || (
                            <FormattedMessage
                                defaultMessage="Please enter your password to continue"
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
}

export default ConfirmPassword;
