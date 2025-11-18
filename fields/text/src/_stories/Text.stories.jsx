/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import InputField from '../InputField';

export default {
    title: 'Fields/Text',
    component: InputField,
    parameters: {
        intl: true,
    },
};

function Container(props) {
    const [value, setValue] = useState(null);
    return <InputField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container placeholder="Text" />,
};

export const Disabled = {
    render: () => <Container placeholder="Text" disabled />,
};

export const WithDataList = {
    render: () => (

    <Container placeholder="With data list" dataList={['Bird', 'Cat', 'Dog', 'Fish', 'Snail']} />

    ),
};

export const Email = {
    render: () => <Container type="email" placeholder="Email" name="Email" />,
};

export const Password = {
    render: () => <Container type="password" placeholder="Password" />,
};

export const Telephone = {
    render: () => <Container type="tel" placeholder="Telephone" name="Telephone" />,
};

export const TextArea = {
    render: () => <Container type="textarea" placeholder="Textarea" />,
};

export const WithErrors = {
    render: () => <Container placeholder="Text" errors={['Invalid field']} />,
};

export const MaxLength = {
    render: () => <Container placeholder="Max 3 characters" maxLength={3} />,
};

export const ReadOnly = {
    render: () => <Container placeholder="Max 3 characters" readOnly />,
};