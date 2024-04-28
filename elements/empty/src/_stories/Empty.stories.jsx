import React from 'react';

import EmptyElement from '../Empty';

export default {
    component: EmptyElement,
    title: 'Elements/Empty',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <EmptyElement>Empty</EmptyElement>;

export const Warning = () => <EmptyElement theme="warning">Empty</EmptyElement>;
