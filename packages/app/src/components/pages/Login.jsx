/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { useUrlGenerator } from '@panneau/core/contexts';

import LoginForm from '../forms/Login';
import GuestLayout from '../layouts/Guest';

const propTypes = {};

const defaultProps = {};

const LoginPage = () => {
    const route = useUrlGenerator();

    // Necessary to update cookies and routes correctly from the backend
    const onSuccess = useCallback(() => {
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
                        <LoginForm onSuccess={onSuccess} />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

LoginPage.propTypes = propTypes;
LoginPage.defaultProps = defaultProps;

export default LoginPage;
