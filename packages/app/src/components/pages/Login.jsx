/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoginForm from '../forms/Login';
import GuestLayout from '../layouts/Guest';

const propTypes = {};

const defaultProps = {};

const LoginPage = () => (
    <GuestLayout fullscreen>
        <div className="container-sm py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6">
                    <h1 className="mb-4">
                        <FormattedMessage defaultMessage="Login" description="Page title" />
                    </h1>
                    <LoginForm />
                </div>
            </div>
        </div>
    </GuestLayout>
);
LoginPage.propTypes = propTypes;
LoginPage.defaultProps = defaultProps;

export default LoginPage;
