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
export const True = {
    render: () => <Boolean value={true} />,
};

export const False = {
    render: () => <Boolean value={false} />,
};

// eslint-disable-next-line react/jsx-boolean-value
export const TrueWithIcon = {
    render: () => <Boolean value={true} iconTrue="check" />,
};

export const FalseWithLabel = {
    render: () => <Boolean value={false} labelFalse="WRONG" />,
};