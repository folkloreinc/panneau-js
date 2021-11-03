/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import Select from '../Select';

export default {
    title: 'Elements/Select',
    component: Select,
};

const options = [
    'one',
    { value: 'two', label: 'Two' },
    { value: 'three', label: 'Very long label that is very annoying indeed' },
    { value: 'four', label: null },
    5,
];

const Container = (props) => {
    const [value, setValue] = useState(null);
    // console.log('select value', value);
    return <Select {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container options={options} />;

export const WithoutReset = () => (
    <Container options={options} withoutReset placeholder="Without reset..." />
);

export const MultiSelect = () => (
    <Container options={options} multiple placeholder="Multi select..." />
);

export const Searchable = () => (
    <Container options={options} multiple searchable placeholder="Multi select searchable..." />
);

export const Size = () => <Container className="w-25" options={options} placeholder="With size" />;

export const AutoSize = () => (
    <Container autoSize options={options} placeholder="With min width..." />
);

export const Stacked = () => {
    const [value, setValue] = useState(null);
    return (
        <>
            <Select options={options} value={value} onChange={setValue} />
            <Select options={options} value={value} onChange={setValue} />
        </>
    );
};
