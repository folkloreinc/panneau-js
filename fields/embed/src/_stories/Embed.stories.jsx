/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import EmbedField from '../EmbedField';

export default {
    title: 'Fields/Embed',
    component: EmbedField,
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return <EmbedField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;

export const WithMetadata = () => (
    <Container url="https://www.youtube.com/watch?v=Xw5AiRVqfqk&t=1058s" />
);
