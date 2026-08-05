import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Field, Label } from '@panneau/core';
import { useFormComponent } from '@panneau/core/contexts';
import Link from '@panneau/element-link';

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
    const FormComponent = useFormComponent('normal');
    const defaultPostForm = useCallback(
        (act: string, data: unknown) =>
            postJSON(act, data, {
                credentials: 'include',
                headers: getCSRFHeaders(),
                method: 'DELETE',
            }),
        [],
    );
    return (
        <FormComponent
            action={action}
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
            postForm={defaultPostForm}
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
        </FormComponent>
    );
}

export default TwoFactorDisable;
