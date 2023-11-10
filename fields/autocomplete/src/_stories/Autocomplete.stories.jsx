/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import AutocompleteField from '../AutocompleteField';

export default {
    title: 'Fields/Autocomplete',
    component: AutocompleteField,
};

const defaultItems = [
    { label: 'Bird', value: 'bird', image: { url: 'https://picsum.photos/200/300' } },
    { label: 'Cat', value: 'cat' },
    { label: 'Dog', value: 'dog' },
    { label: 'Fish', value: 'fish' },
    { label: 'Snail', value: 'snail' },
];

const Container = (props) => {
    const { value: defaultValue = null, items = null } = props || {};
    const [value, setValue] = useState(defaultValue);
    return (
        <AutocompleteField
            {...props}
            value={value}
            items={items}
            onChange={setValue}
            placeholder="Autocomplete..."
        />
    );
};

export const Normal = () => <Container items={defaultItems} />;

export const Empty = () => <Container />;

export const WithoutMatch = () => <Container items={defaultItems} withoutMatch />;

export const Disabled = () => (
    <Container disabled value={defaultItems[0].label} items={defaultItems} />
);
