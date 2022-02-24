import React from 'react';
import withFormsFields from '../../../../.storybook/decorators/withFormsFields';
import withRouter from '../../../../.storybook/decorators/withRouter';
import ForgotPassword from '../ForgotPassword';
import Login from '../Login';
import Register from '../Register';
import ResetPassword from '../ResetPassword';
import TwoFactor from '../TwoFactor';

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

export const TwoFactorForm = () => <TwoFactor />;
