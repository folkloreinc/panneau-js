import React from 'react';

import AlertElement from '../Alert';

export default {
    component: AlertElement,
    title: 'Elements/Alert',
    parameters: {
        intl: true,
    },
};

export const Success = () => <AlertElement theme="success">Good alert</AlertElement>;

export const Error = () => <AlertElement theme="danger">Bad alert</AlertElement>;
