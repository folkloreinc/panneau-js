import React, { useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import Inline from '../Inline';

export default {
    component: Inline,
    title: 'Forms/Inline',
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
    return <Inline fields={fields} value={value} onChange={setValue} />;
};

export const Normal = () => <Container fields={fields} />;
