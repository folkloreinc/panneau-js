/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

interface EmailFieldProps {
    [key: string]: unknown;
}

function EmailField(props: EmailFieldProps) {
    return <InputField {...props} type="email" />;
}

export default EmailField;
