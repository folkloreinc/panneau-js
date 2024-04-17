/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import Fields from '../Fields';

export default {
    component: Fields,
    title: 'Fields/Fields',
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue = {}, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <FieldsProvider>
            <Fields fields={fields} value={value} onChange={setValue} {...props} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container />;

export const WithFlat = () => <Container />;

export const Horizontal = () => <Container horizontal />;
