/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import UrlField from '../UrlField';

export default {
    title: 'Fields/Url',
    component: UrlField,
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return <UrlField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;

export const Disabled = () => <Container disabled value="hello" />;

export const Prepend = () => <Container disabled prepend="hello" append="goodbye" />;

export const WithUrl = () => <Container url="https://test.com/chose/" />;
