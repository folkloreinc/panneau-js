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

const Container = () => {
    const [value, setValue] = useState({});
    return (
        <FieldsProvider>
            <Fields fields={fields} value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container />;

export const WithFlat = () => <Container />;
