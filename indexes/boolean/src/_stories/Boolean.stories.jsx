import React from 'react';

import Boolean from '../Boolean';

export default {
    component: Boolean,
    title: 'Index/Boolean',
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/jsx-boolean-value
export const True = () => <Boolean value={true} />;

export const False = () => <Boolean value={false} />;
