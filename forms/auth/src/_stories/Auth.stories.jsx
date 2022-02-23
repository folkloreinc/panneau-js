import React from 'react';
import FieldsProvider from '../../../../packages/fields';
import FormsProvider from '../../../../packages/forms';
import ForgotPassword from '../ForgotPassword';
import Login from '../Login';
import ResetPassword from '../ResetPassword';

export default {
    component: Login,
    title: 'Forms/Auth',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <FieldsProvider>
                <FormsProvider>
                    <Story />
                </FormsProvider>
            </FieldsProvider>
        ),
    ],
};

export const LoginForm = () => <Login />;

export const ForgotPasswordForm = () => <ForgotPassword />;

export const ResetPasswordForm = () => <ResetPassword />;
