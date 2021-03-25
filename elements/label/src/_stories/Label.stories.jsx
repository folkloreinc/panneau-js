import React from 'react';

import LabelElement from '../Label';

export default {
    component: LabelElement,
    title: 'Elements/Label',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <LabelElement>{{ id: 'test', defaultMessage: 'Translated label' }}</LabelElement>
);
