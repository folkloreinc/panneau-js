import React from 'react';

import FormGroup from '../FormGroup';

export default {
    component: FormGroup,
    title: 'Elements/FormGroup',
    parameters: {
        intl: true,
    },
};

const Field = () => <div>A field is here</div>;

export const Normal = () => <FormGroup label="Form group label"><Field /></FormGroup>;

export const WithCard = () => <FormGroup label="Form group label" withCard><Field /></FormGroup>;

export const WithHelpText = () => (
    <FormGroup label="Form group label" helpText="Help me!">
        <Field />
    </FormGroup>
);

export const WithErrors = () => (
    <FormGroup
        label="Form group label"
        helpText="Help me!"
        errors={['This is bad', "Don't do this"]}
    >
        <Field />
    </FormGroup>
);
