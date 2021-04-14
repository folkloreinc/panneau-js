/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import ColorField from '../ColorField';

export default {
    title: 'Fields/Color',
    component: ColorField,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <ColorField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container />;
export const Native = () => <Container native />;
