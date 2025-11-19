/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import DateTimeField from './DateTimeField';

interface DateFieldProps {
    dateFormat?: string;
    [key: string]: unknown;
}

function TimeField({ dateFormat = 'yyyy-MM-dd', ...props }: DateFieldProps) {
    return <DateTimeField {...props} withoutTime dateFormat={dateFormat} />;
}

export default TimeField;
