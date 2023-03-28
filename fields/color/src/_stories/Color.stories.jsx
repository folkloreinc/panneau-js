/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import ColorField from '../ColorField';

export default {
    title: 'Fields/Color',
    component: ColorField,
};

const Container = (props) => {
    const { value: defaultValue = '#F00' } = props || {};
    const [value, setValue] = useState(defaultValue);
    return <ColorField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;

export const NormalAlpha = () => <Container withAlpha />;

export const NormalEmpty = () => <Container value={null} />;

export const NormalDisabled = () => <Container disabled />;

export const Native = () => <Container native />;

export const NativeDisabled = () => <Container native disabled />;
