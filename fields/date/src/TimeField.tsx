/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import DateTimeField from './DateTimeField';

interface TimeFieldProps {
    dateFormat?: string;
    [key: string]: unknown;
}

function TimeField({ dateFormat = 'HH:mm', ...props }: TimeFieldProps) {
    return <DateTimeField {...props} withoutDate dateFormat={dateFormat} />;
}

export default TimeField;
