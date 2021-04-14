import React, { useState } from 'react';

import Inline from '../Inline';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Inline,
    title: 'Forms/Inline',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({});
    return (
        <FieldsProvider>
            <Inline fields={fields} value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container fields={fields} />;
