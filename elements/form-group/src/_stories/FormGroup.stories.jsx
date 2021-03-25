import React from 'react';

import FormGroup from '../FormGroup';

export default {
    component: FormGroup,
    title: 'Elements/FormGroup',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <FormGroup label="Form group label">A field is here</FormGroup>;

export const WithHelpText = () => (
    <FormGroup label="Form group label" helpText="Help me!">
        A field is here
    </FormGroup>
);

export const WithErrors = () => (
    <FormGroup
        label="Form group label"
        helpText="Help me!"
        errors={['This is bad', "Don't do this"]}
    >
        A field is here
    </FormGroup>
);
