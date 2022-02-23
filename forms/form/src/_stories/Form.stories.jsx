import React, { useCallback, useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import FormsProvider from '../../../../packages/forms';
import Form from '../Form';

export default {
    component: Form,
    title: 'Forms/Form',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <FieldsProvider>
                <FormsProvider>
                    <Story />
                </FormsProvider>
            </FieldsProvider>
        ),
    ],
};

const Container = () => {
    const [value, setValue] = useState({});
    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            console.log(e, value); // eslint-disable-line
        },
        [value],
    );
    return <Form value={value} onChange={setValue} onSubmit={onSubmit} />;
};

export const Normal = () => <Container fields={fields} />;
