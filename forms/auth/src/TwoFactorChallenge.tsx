import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';

interface TwoFactorChallengeProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    codeLabel?: Label | null;
    submitButtonLabel?: Label | null;
}

function TwoFactorChallenge({
    action = '/two-factor-challenge',
    fields = null,
    size = 'lg',
    codeLabel = null,
    submitButtonLabel = null,
    ...props
}: TwoFactorChallengeProps) {
    const FormComponent = useFormComponent('normal');
    return (
        <FormComponent
            action={action}
            fields={
                fields || [
                    {
                        name: 'code',
                        type: 'text',
                        size,
                        label: codeLabel || (
                            <FormattedMessage
                                defaultMessage="Enter the code from your authenticator app to continue"
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

export default TwoFactorChallenge;
