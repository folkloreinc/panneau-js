/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

interface PasswordFieldProps {
    [key: string]: unknown;
}

function PasswordField(props: PasswordFieldProps) {
    return <InputField {...props} type="password" />;
}

export default PasswordField;
