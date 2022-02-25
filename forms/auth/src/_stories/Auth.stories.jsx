import React from 'react';
import withFormsFields from '../../../../.storybook/decorators/withFormsFields';
import withRouter from '../../../../.storybook/decorators/withRouter';
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
    decorators: [withFormsFields, withRouter],
};

export const LoginForm = () => <Login />;

export const ForgotPasswordForm = () => <ForgotPassword />;

export const ResetPasswordForm = () => <ResetPassword />;

export const RegisterForm = () => <Register />;

export const ConfirmPasswordForm = () => <ConfirmPassword />;

export const TwoFactorChallengeForm = () => <TwoFactorChallenge />;

export const TwoFactorEnableForm = () => <TwoFactorEnable />;

export const TwoFactorDisableForm = () => <TwoFactorDisable />;
