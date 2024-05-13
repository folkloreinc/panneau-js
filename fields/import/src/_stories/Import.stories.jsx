/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import ImportField from '../ImportField';

export default {
    title: 'Fields/Import',
    component: ImportField,
    parameters: {
        intl: true,
    },
};

const template = {
    columns: [
        {
            name: 'First Name',
            key: 'first_name',
            required: true,
            description: 'The first name of the user',
            suggested_mappings: ['First', 'Name'],
        },
        {
            name: 'Age',
            data_type: 'number',
        },
    ],
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue = null, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return <ImportField template={template} {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;

export const Disabled = () => <Container disabled />;

export const isModal = () => <Container isModal />;

export const isModalDisabled = () => <Container isModal disabled />;
