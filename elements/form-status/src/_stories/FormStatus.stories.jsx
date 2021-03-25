import React from 'react';

import FormStatus from '../FormStatus';

export default {
    component: FormStatus,
    title: 'Elements/FormStatus',
    parameters: {
        intl: true,
    },
};

export const Success = () => <FormStatus status="success" />;

export const Loading = () => <FormStatus status="loading" />;

export const Error = () => <FormStatus status="error" />;
