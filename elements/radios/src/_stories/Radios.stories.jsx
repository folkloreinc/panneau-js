/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import Radios from '../Radios';

export default {
    title: 'Fields/Radios',
    component: Radios,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return <Radios {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container options={['One', 'Two', 'Three']} />;
