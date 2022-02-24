/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import formFields from '../../../../.storybook/data/form-fields';
import withFormsFields from '../../../../.storybook/decorators/withFormsFields';
import Form from '../Form';

export default {
    component: Form,
    title: 'Forms/Form',
    parameters: {
        intl: true,
    },
    decorators: [withFormsFields],
};

const Container = (props) => {
    const [value, setValue] = useState({});
    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            console.log(e, value); // eslint-disable-line
        },
        [value],
    );
    return <Form value={value} onChange={setValue} onSubmit={onSubmit} {...props} />;
};

export const Normal = () => <Container fields={fields} />;

export const WithRegularFields = () => <Container fields={formFields} />;
