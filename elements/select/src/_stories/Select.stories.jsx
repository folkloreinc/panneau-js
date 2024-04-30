/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import Select from '../Select';

export default {
    title: 'Elements/Select',
    component: Select,
    parameters: {
        intl: true,
    },
};

const options = [
    'one',
    { value: '2', label: 'Two' },
    { value: '3', label: 'Very long label that is very annoying indeed' },
    { value: '4', label: 'Blabla' },
    5,
];

const itemOptions = [
    { id: 1, title: 'One', something: '4' },
    { id: 2, title: 'Two' },
    { id: 3, title: 'Three' },
];

const Container = (props) => {
    const [value, setValue] = useState(null);
    return <Select {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container options={options} placeholder="Placeholder..." />;

export const WithoutReset = () => (
    <Container options={options} withoutReset placeholder="Without reset..." />
);

export const MultiSelect = () => (
    <Container options={options} multiple placeholder="Multi select..." />
);

export const MultiSelectDark = () => (
    <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
        <Container options={options} multiple placeholder="Multi select..." />
    </div>
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

export const WithItems = () => (
    <Container
        options={itemOptions}
        getOptionLabel={(opt) => opt.title}
        getOptionValue={(opt) => opt.id}
    />
);

export const WithItemsMultiple = () => (
    <Container
        options={itemOptions}
        multiple
        getOptionLabel={(opt) => opt.title}
        getOptionValue={(opt) => opt.id}
    />
);
