import React, { useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import Normal from '../Normal';

export default {
    component: Normal,
    title: 'Forms/Normal',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <FieldsProvider>
                <Story />
            </FieldsProvider>
        ),
    ],
};

const Container = () => {
    const [value, setValue] = useState({});
    return <Normal fields={fields} value={value} onChange={setValue} />;
};

export const NormalForm = () => <Container />;
