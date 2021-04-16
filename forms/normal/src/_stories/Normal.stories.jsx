import React, { useState } from 'react';

import Normal from '../Normal';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

export default {
    component: Normal,
    title: 'Forms/Normal',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({});
    return (
        <FieldsProvider>
            <Normal fields={fields} value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const NormalForm = () => <Container />;
