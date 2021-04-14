/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import UrlField from '../UrlField';

export default {
    title: 'Fields/Url',
    component: UrlField,
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <UrlField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container />;
