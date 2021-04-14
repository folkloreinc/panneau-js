/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import RadiosField from '../RadiosField';

export default {
    title: 'Fields/Radios',
    component: RadiosField,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return <RadiosField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container options={['One', 'Two', 'Three']} />;
