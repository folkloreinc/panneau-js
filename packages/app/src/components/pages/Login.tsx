import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useUrlGenerator } from '@panneau/core/contexts';

import LoginForm from '../forms/Login';
import GuestLayout from '../layouts/Guest';

function LoginPage() {
    const route = useUrlGenerator();
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
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

export default LoginPage;
