/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import TextField from '../TextField';

export default {
    title: 'Fields/Text',
    component: TextField,
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return <TextField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container placeholder="Text" />;

export const WithDataList = () => (
    <Container placeholder="With data list" dataList={['Bird', 'Cat', 'Dog', 'Fish', 'Snail']} />
);

export const Email = () => <Container type="email" placeholder="Email" />;

export const Password = () => <Container type="password" placeholder="Password" />;

export const Telephone = () => <Container type="tel" placeholder="Telephone" />;

export const TextArea = () => <Container type="textarea" placeholder="Textarea" />;

export const WithErrors = () => <Container placeholder="Text" errors={['Invalid field']} />;

export const MaxLength = () => <Container placeholder="Max 3 characters" maxLength={3} />;
