import React from 'react';

import ResourceCardsElement from '../ResourceCards';

export default {
    component: ResourceCardsElement,
    title: 'Elements/ResourceCards',
    parameters: {
        intl: true,
    },
};

const value = [
    { id: 1, name: 'Paul', label: 'PAUL' },
    { id: 2, name: 'Paul', label: 'PAUL' },
    { id: 3, name: 'Paul', label: 'PAUL' },
    { id: 4, name: 'Paul', label: 'PAUL' },
    { id: 5, name: 'Paul', label: 'PAUL' },
];

export const Normal = () => <ResourceCardsElement value={value} itemLabelPath="name" />;
