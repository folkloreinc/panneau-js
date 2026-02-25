import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

interface TwoFactorEnableProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    explainationLabel?: Label | null;
    submitButtonLabel?: Label | null;
    withSkipLink?: boolean;
    skipLink?: string;
    skipLabel?: Label | null;
}

function TwoFactorEnable({
    action = '/user/two-factor-authentication',
    fields = null,
    explainationLabel = null,
    submitButtonLabel = null,
    size = 'lg',
    withSkipLink = true,
    skipLink = '/home',
    skipLabel = null,
    ...props
}: TwoFactorEnableProps) {
    return (
        <Form
            action={action}
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage
                        defaultMessage="Enable two factor authentication"
                        description="Button label"
                    />
                )
            }
            actions={
                withSkipLink ? (
                    <Link className="py-2 px-4" href={skipLink}>
                        {skipLabel || (
                            <FormattedMessage
                                defaultMessage="Skip setup"
                                description="Link label"
                            />
                        )}
                    </Link>
                ) : null
            }
            {...props}
        >
            <p>
                {explainationLabel || (
                    <FormattedMessage
                        defaultMessage="Do you wish to enable two factor authentication on your account? You will have to use an authentication app such as Google Authenticator or Microsoft Authenticator in addition to your password to connect."
                        description="Explaination label"
                    />
                )}
            </p>
        </Form>
    );
}

export default TwoFactorEnable;
