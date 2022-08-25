import React, { useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import Horizontal from '../Horizontal';

export default {
    component: Horizontal,
    title: 'Forms/Horizontal',
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
    return <Horizontal fields={fields} value={value} onChange={setValue} />;
};

export const Normal = () => <Container fields={fields} />;
