import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useUrlGenerator } from '@panneau/core/contexts';
import GuestLayout from '../layouts/Guest';
import LoginForm from '../forms/Login';

const propTypes = {};

const defaultProps = {};

const AuthLoginPage = () => {
    const route = useUrlGenerator();
    const onSuccess = useCallback(() => {
        window.location.href = route('home');
    }, [route]);
    return (
        <GuestLayout fullscreen>
            <div className="container-sm">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6">
                        <h1 className="mb-4">
                            <FormattedMessage id="pages.login.title" defaultMessage="Login" />
                        </h1>
                        <LoginForm onSuccess={onSuccess} />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};
AuthLoginPage.propTypes = propTypes;
AuthLoginPage.defaultProps = defaultProps;

export default AuthLoginPage;
