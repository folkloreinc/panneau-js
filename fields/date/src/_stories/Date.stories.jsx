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
    const [value, setValue] = useState('2002-01-02T00:00:00-05:00');
    return (
        <DateTimeField value={value} onChange={setValue} placeholder="Select date and time..." />
    );
};

export const Empty = () => {
    const [value, setValue] = useState(null);
    return (
        <DateTimeField value={value} onChange={setValue} placeholder="Select date and time..." />
    );
};

export const DateOnly = () => {
    const [value, setValue] = useState('2002-01-02');
    return <DateField value={value} onChange={setValue} placeholder="Select date..." />;
};

export const TimeOnly = () => {
    const [value, setValue] = useState(null);
    return <TimeField value={value} onChange={setValue} placeholder="Select time..." />;
};

export const TimeWithFormat = () => {
    const [value, setValue] = useState('12:30');
    return (
        <TimeField value={value} format="H:m" onChange={setValue} placeholder="Select time..." />
    );
};
