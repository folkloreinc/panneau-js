import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import Link from '@panneau/element-link';
import Form from '@panneau/form';

interface TwoFactorDisableProps {
    action?: string;
    fields?: Field[] | null;
    size?: string;
    explainationLabel?: Label | null;
    submitButtonLabel?: Label | null;
    withCancelLink?: boolean;
    cancelLink?: string;
    cancelLabel?: Label | null;
}

function TwoFactorDisable({
    action = '/user/two-factor-authentication',
    fields = null,
    explainationLabel = null,
    submitButtonLabel = null,
    size = 'lg',
    withCancelLink = true,
    cancelLink = '/home',
    cancelLabel = null,
    ...props
}: TwoFactorDisableProps) {
    // Use the data form so the request is actually sent with the DELETE method
    // (a native form only supports GET/POST)
    return (
        <Form
            type="normal"
            action={action}
            method="DELETE"
            submitButtonLabel={
                submitButtonLabel || (
                    <FormattedMessage
                        defaultMessage="Disable two factor authentication"
                        description="Button label"
                    />
                )
            }
            actions={
                withCancelLink ? (
                    <Link className="py-2 px-4" href={cancelLink}>
                        {cancelLabel || (
                            <FormattedMessage defaultMessage="Cancel" description="Link label" />
                        )}
                    </Link>
                ) : null
            }
            {...props}
        >
            <p>
                {explainationLabel || (
                    <FormattedMessage
                        defaultMessage="Do you really wish to disable two factor authentication on your account?"
                        description="Explaination label"
                    />
                )}
            </p>
        </Form>
    );
}

export default TwoFactorDisable;
