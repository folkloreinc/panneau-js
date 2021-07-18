/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import DateField from '../DateField';
import DateTimeField from '../DateTimeField';
import TimeField from '../TimeField';

export default {
    title: 'Fields/Date',
    component: DateTimeField,
    parameters: {
        intl: true,
    },
};

export const Normal = () => {
    const [value, setValue] = useState(null);
    return (
        <DateTimeField value={value} onChange={setValue} placeholder="Select date and time..." />
    );
};

export const DateOnly = () => {
    const [value, setValue] = useState(null);
    return <DateField value={value} onChange={setValue} placeholder="Select date..." />;
};

export const TimeOnly = () => {
    const [value, setValue] = useState('12:30');
    return <TimeField value={value} onChange={setValue} placeholder="Select time..." />;
};
