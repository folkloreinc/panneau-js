import React, { useState } from 'react';

import Fields from '../Fields';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

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
