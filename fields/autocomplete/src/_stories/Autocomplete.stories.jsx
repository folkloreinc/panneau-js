/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import AutocompleteField from '../AutocompleteField';

export default {
    title: 'Fields/Autocomplete',
    component: AutocompleteField,
};

const items = [
    { label: 'Bird', value: 'bird' },
    { label: 'Cat', value: 'cat' },
    { label: 'Dog', value: 'dog' },
    { label: 'Fish', value: 'fish' },
    { label: 'Snail', value: 'snail' },
];

const Container = (props) => {
    const { value: defaultValue = null } = props || {};
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

export const Normal = () => <Container />;

export const Disabled = () => <Container disabled value={items[0].label} />;
