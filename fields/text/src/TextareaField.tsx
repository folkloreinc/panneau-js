/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

interface TextareaFieldProps {
    [key: string]: unknown;
}

function TextareaField(props: TextareaFieldProps) {
    return <InputField {...props} type="textarea" />;
}

export default TextareaField;
