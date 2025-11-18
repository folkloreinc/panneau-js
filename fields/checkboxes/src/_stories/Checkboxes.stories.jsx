/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import CheckboxesField from '../CheckboxesField';

export default {
    title: 'Fields/Checkboxes',
    component: CheckboxesField,
};

function Container(props) {
    const { value: defaultValue = null } = props || {};
    const [value, setValue] = useState(defaultValue);
    return <CheckboxesField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container options={['One', 'Two', 'Three']} />,
};

export const Disabled = {
    render: () => (

    <Container options={['One', 'Two', 'Three']} disabled value={['One']} />

    ),
};