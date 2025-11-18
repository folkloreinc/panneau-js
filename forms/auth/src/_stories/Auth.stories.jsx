import React from 'react';
import withFormsFields from '../../../../.storybook/decorators/withFormsFields';
import ChangePassword from '../ChangePassword';
import ConfirmPassword from '../ConfirmPassword';
import ForgotPassword from '../ForgotPassword';
import Login from '../Login';
import Register from '../Register';
import ResetPassword from '../ResetPassword';
import TwoFactorChallenge from '../TwoFactorChallenge';
import TwoFactorDisable from '../TwoFactorDisable';
import TwoFactorEnable from '../TwoFactorEnable';

export default {
    component: Login,
    title: 'Forms/Auth',
    parameters: {
        intl: true,
    },
    decorators: [withFormsFields],
};

export const LoginForm = {
    render: () => <Login />,
};

export const ForgotPasswordForm = {
    render: () => <ForgotPassword />,
};

export const ResetPasswordForm = {
    render: () => <ResetPassword value={{ email: 'paul@paul.com' }} />,
};

export const RegisterForm = {
    render: () => <Register />,
};

export const ConfirmPasswordForm = {
    render: () => <ConfirmPassword />,
};

export const ChangePasswordForm = {
    render: () => <ChangePassword />,
};

export const TwoFactorChallengeForm = {
    render: () => <TwoFactorChallenge />,
};

export const TwoFactorEnableForm = {
    render: () => <TwoFactorEnable />,
};

export const TwoFactorDisableForm = {
    render: () => <TwoFactorDisable />,
};