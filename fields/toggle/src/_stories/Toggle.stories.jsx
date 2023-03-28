/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import ToggleField from '../ToggleField';

export default {
    title: 'Fields/Toggle',
    component: ToggleField,
};

const Container = (props = null) => {
    const [value, setValue] = useState(null);
    return <ToggleField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;

export const Disabled = () => <Container disabled />;
