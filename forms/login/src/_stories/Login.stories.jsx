import React from 'react';

import LoginForm from '../Login';

export default {
    component: LoginForm,
    title: 'Forms/Login',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <LoginForm />;
