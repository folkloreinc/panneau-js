import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { usePanneauAuth, useUrlGenerator } from '@panneau/core/contexts';
import Link from '@panneau/element-link';

import LoginForm from '../forms/Login';
import GuestLayout from '../layouts/Guest';

function getLink(link: boolean | string | undefined, defaultLink: string): string | null {
    if (typeof link === 'string') {
        return link;
    }
    return link === true ? defaultLink : null;
}

function LoginPage() {
    const route = useUrlGenerator();
    const { forgotPassword, register } = usePanneauAuth();
    const forgotPasswordLink = getLink(forgotPassword, '/forgot-password');
    const registerLink = getLink(register, '/register');
    // Sadly necessary to update cookies and routes correctly from the backend,
    // make it post directly instead of api call
    const onComplete = useCallback(() => {
        window.location.href = route('home');
    }, [route]);
    return (
        <GuestLayout fullscreen>
            <div className="container-sm py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6">
                        <h1 className="mb-4">
                            <FormattedMessage defaultMessage="Login" description="Page title" />
                        </h1>
                        <LoginForm onComplete={onComplete} />
                        {forgotPasswordLink !== null || registerLink !== null ? (
                            // These pages are served by the backend, not by the app router
                            <div className="d-flex flex-wrap gap-3 mt-4">
                                {forgotPasswordLink !== null ? (
                                    <Link href={forgotPasswordLink} external target="_self">
                                        <FormattedMessage
                                            defaultMessage="Forgot your password?"
                                            description="Link label"
                                        />
                                    </Link>
                                ) : null}
                                {registerLink !== null ? (
                                    <Link href={registerLink} external target="_self">
                                        <FormattedMessage
                                            defaultMessage="Create account"
                                            description="Button label"
                                        />
                                    </Link>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

export default LoginPage;
