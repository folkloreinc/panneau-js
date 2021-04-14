/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import ToggleField from '../ToggleField';

export default {
    title: 'Fields/Toggle',
    component: ToggleField,
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <ToggleField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container />;
