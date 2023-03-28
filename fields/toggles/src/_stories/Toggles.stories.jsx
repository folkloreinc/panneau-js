/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import TogglesField from '../TogglesField';

export default {
    title: 'Fields/Toggles',
    component: TogglesField,
};

const values = [
    { key: '1', label: 'One' },
    { key: '2', label: 'Two' },
    { key: '3', label: 'Three' },
];

const Container = (props) => {
    const [value, setValue] = useState(null);
    return <TogglesField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container toggles={values} />;

export const Disabled = () => <Container toggles={values} disabled />;
