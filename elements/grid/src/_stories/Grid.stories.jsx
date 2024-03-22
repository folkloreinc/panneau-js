import React from 'react';

import GridElement from '../Grid';

const items = [
    { id: 1, name: 'Paul 1' },
    { id: 2, name: 'Paul 2' },
    { id: 3, name: 'Paul 3' },
    { id: 4, name: 'Paul 4' },
    { id: 5, name: 'Paul 5' },
];

export default {
    component: GridElement,
    title: 'Elements/Grid',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <GridElement items={items} component={({ value }) => <p>{value.name}</p>} />
);
