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

function Container(props) {
    const [value, setValue] = useState(null);
    return <Select {...props} value={value} onChange={setValue} />;
}

export function Normal() {
    return <Container options={options} placeholder="Placeholder..." />;
}

export function WithoutReset() {
    return (
        <Container options={options} withoutReset placeholder="Without reset..." />
    );
}

export function MultiSelect() {
    return (
        <Container options={options} multiple placeholder="Multi select..." />
    );
}

export function MultiSelectDark() {
    return (
        <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
            <Container options={options} multiple placeholder="Multi select..." />
        </div>
    );
}

export function Searchable() {
    return (
        <Container options={options} multiple searchable placeholder="Multi select searchable..." />
    );
}

export function Size() {
    return <Container className="w-25" options={options} placeholder="With size" />;
}

export function AutoSize() {
    return (
        <Container autoSize options={options} placeholder="With min width..." />
    );
}

export function Stacked() {
    const [value, setValue] = useState(null);
    return (
        <>
            <Select options={options} value={value} onChange={setValue} />
            <Select options={options} value={value} onChange={setValue} />
        </>
    );
}

export function WithItems() {
    return (
        <Container
            options={itemOptions}
            getOptionLabel={(opt) => opt.title}
            getOptionValue={(opt) => opt.id}
        />
    );
}

export function WithItemsMultiple() {
    return (
        <Container
            options={itemOptions}
            multiple
            getOptionLabel={(opt) => opt.title}
            getOptionValue={(opt) => opt.id}
        />
    );
}
