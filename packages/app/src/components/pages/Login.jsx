/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { usePanneauMessages, useUrlGenerator } from '@panneau/core/contexts';
import GuestLayout from '../layouts/Guest';
import LoginForm from '../forms/Login';

const propTypes = {};

const defaultProps = {};

const LoginPage = () => {
    const messages = usePanneauMessages();
    const { login_title: loginMessage = null } = messages || {};

    const route = useUrlGenerator();
    const onSuccess = useCallback(() => {
        window.location.href = route('home');
    }, [route]);
    return (
        <GuestLayout fullscreen>
            <div className="container-sm py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6">
                        <h1 className="mb-4">
                            <FormattedMessage {...loginMessage} />
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
