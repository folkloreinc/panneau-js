/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import InputField from './InputField';

interface TelephoneFieldProps {
    [key: string]: unknown;
}

function TelephoneField(props: TelephoneFieldProps) {
    return <InputField {...props} type="tel" />;
}

export default TelephoneField;
