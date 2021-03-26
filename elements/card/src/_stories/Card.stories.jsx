import React from 'react';

import CardElement from '../Card';

export default {
    component: CardElement,
    title: 'Elements/Card',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <CardElement header={<h1>Title</h1>} />;

export const WithTheme = () => (
    <CardElement header={<h1>Title</h1>} footer={<p>Footer</p>} theme="danger" />
);
