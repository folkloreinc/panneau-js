import { FormattedMessage } from 'react-intl';

import type { ControlSize, Field, Label } from '@panneau/core';
import Form from '@panneau/form';

interface ChangePasswordProps {
    action?: string;
    fields?: Field[] | null;
    size?: ControlSize;
    currentPasswordLabel?: Label | null;
    passwordLabel?: Label | null;
    passwordConfirmationLabel?: Label | null;
    submitButtonLabel?: Label | null;
}

function ChangePassword({
    action = '/user/password',
    fields = null,
    size = 'lg',
    currentPasswordLabel = null,
    passwordLabel = null,
    passwordConfirmationLabel = null,
    submitButtonLabel = null,
    ...props
}: ChangePasswordProps) {
    // Use the data form so the request is actually sent with the PUT method
    // (a native form only supports GET/POST)
    return (
        <Form
            type="normal"
            action={action}
            method="PUT"
            fields={
                fields !== null && fields.length > 0
                    ? fields
                    : [
                          {
                              name: 'current_password',
                              type: 'password',
                              size,
                              label: currentPasswordLabel || (
                                  <FormattedMessage
                                      defaultMessage="Current password"
                                      description="Field label"
                                  />
                              ),
                          },
                          {
                              name: 'password',
                              type: 'password',
                              size,
                              label: passwordLabel || (
                                  <FormattedMessage
                                      defaultMessage="New password"
                                      description="Field label"
                                  />
                              ),
                          },
                          {
                              name: 'password_confirmation',
                              type: 'password',
                              size,
                              label: passwordConfirmationLabel || (
                                  <FormattedMessage
                                      defaultMessage="Confirm your new password"
                                      description="Field label"
                                  />
                              ),
                          },
                      ]
            }
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage defaultMessage="Update password" description="Button label" />
                )
            }
            {...props}
        />
    );
}

export default ChangePassword;
