import React from 'react';
import Select from '../Select';

export default {
    component: Select,
    title: 'Displays/Select',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <Select value="hello" field={{ options: [{ label: 'Hello!', value: 'hello' }] }} />
);
