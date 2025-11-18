import React from 'react';
import Label from '../Label';

export default {
    component: Label,
    title: 'Displays/Label',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <Label value="hello" labels={{ hello: 'Hello!' }} />,
};