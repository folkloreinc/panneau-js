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
    <Select
        value="hello"
        field={{
            options: [
                { label: 'Hello!', value: 'hello' },
                { label: 'Goodbye!', value: 'goodbye' },
            ],
        }}
    />
);

export const Empty = () => <Select value="hello" />;

export const withOptions = () => (
    <Select
        value="hello"
        options={[
            { label: 'Hello!', value: 'hello' },
            { label: 'Goodbye!', value: 'goodbye' },
        ]}
        onChange={() => {}} // eslint-disable-line no-console
    />
);
