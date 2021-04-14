/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import ItemsField from '../ItemsField';

export default {
    title: 'Fields/Items',
    component: ItemsField,
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <ItemsField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container />;
