/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

interface TextFieldProps {
    [key: string]: unknown;
}

function TextField(props: TextFieldProps) {
    return <InputField {...props} type="text" />;
}

export default TextField;
