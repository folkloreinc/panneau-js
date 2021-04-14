import React, { useState } from 'react';

import Default from '../Default';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Default,
    title: 'Forms/Default',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({});

    console.log('value update', value);

    return (
        <FieldsProvider>
            <Default fields={fields} value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container />;
