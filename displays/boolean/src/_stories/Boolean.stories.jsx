import React from 'react';

import Boolean from '../Boolean';

export default {
    component: Boolean,
    title: 'Displays/Boolean',
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/jsx-boolean-value
export const True = () => <Boolean value={true} />;

export const False = () => <Boolean value={false} />;

// eslint-disable-next-line react/jsx-boolean-value
export const TrueWithIcon = () => <Boolean value={true} iconTrue="check" />;

export const FalseWithLabel = () => <Boolean value={false} labelFalse="WRONG" />;
