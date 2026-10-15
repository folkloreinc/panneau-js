import { useCallback } from 'react';

import { useAuth } from '@panneau/auth';
import { useUrlGenerator } from '@panneau/core/contexts';
import Form from '@panneau/form';

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
    return (
        <Form
            type="login"
            action={url('auth.login')}
            postForm={postForm}
            onComplete={onComplete}
            className={className}
        />
    );
}

export default LoginForm;
