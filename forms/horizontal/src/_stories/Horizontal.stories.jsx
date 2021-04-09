import React, { useState } from 'react';

import Horizontal from '../Horizontal';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Horizontal,
    title: 'Forms/Horizontal',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({});
    return (
        <FieldsProvider>
            <Horizontal fields={fields} value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container fields={fields} />;
