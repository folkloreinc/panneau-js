/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import NumberField from '../NumberField';

export default {
    title: 'Fields/Number',
    component: NumberField,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <NumberField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container placeholder="Integers" />;
export const WithDataList = () => <Container dataList={[0, 10, 20, 30, 40, 50]} placeholder="With data list" />;
export const WithFloats = () => <Container dataList={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} float placeholder="With floats" />;
export const WithAppend = () => <Container placeholder="With append" append="CAD $" />;
