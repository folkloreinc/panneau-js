import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '@panneau/auth';
import { useFormsComponents, useUrlGenerator } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';

interface LoginFormProps {
    className?: string | null;
    onComplete?: (() => void) | null;
}

function LoginForm({ className = null, onComplete = null }: LoginFormProps) {
    const url = useUrlGenerator();
    const { login } = useAuth();
    const postForm = useCallback(
        (action: string, { email, password }: { email: string; password: string }) =>
            login(email, password),
        [login],
    );
    const FormComponents = useFormsComponents();
    const FormComponent = getComponentFromName('login', FormComponents);
    return FormComponent !== null ? (
        <FormComponent
            action={url('auth.login')}
            postForm={postForm}
            onComplete={onComplete}
            className={className}
            submitButtonLabel={
                <FormattedMessage defaultMessage="Log in" description="Button label" />
            }
        />
    ) : null;
}

export default LoginForm;
