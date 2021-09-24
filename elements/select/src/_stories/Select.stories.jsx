/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import Select from '../Select';

export default {
    title: 'Elements/Select',
    component: Select,
};

const options = ['one', { value: 'two', label: 'Two' }, { value: 'three' }, { value: 'four', label: null }];

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

export const Stacked = () => {
    const [value, setValue] = useState(null);
    return (
        <>
            <Select options={options} value={value} onChange={setValue} />
            <Select options={options} value={value} onChange={setValue} />
        </>
    );
};
