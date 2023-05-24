import React from 'react';

import TextField from '../../../../fields/text/src/TextField';
import FormGroup from '../FormGroup';

export default {
    component: FormGroup,
    title: 'Elements/FormGroup',
    parameters: {
        intl: true,
    },
};

const Field = () => (
    <FormGroup label="Field form group label">
        <TextField placeholder="My text field" />
    </FormGroup>
);

export const Normal = () => (
    <FormGroup label="Form group label">
        <Field />
    </FormGroup>
);

export const IsCard = () => (
    <FormGroup label="Form group label" isCard>
        <Field />
    </FormGroup>
);

export const IsHeading = () => (
    <>
        <FormGroup label="Form group label">
            <Field />
        </FormGroup>
        <FormGroup label="Form group label" isHeading>
            <Field />
        </FormGroup>
    </>
);

export const IsCollapsible = () => (
    <FormGroup label="Form group label" isCollapsible>
        <Field />
    </FormGroup>
);

export const IsCollapsibleCard = () => (
    <FormGroup label="Form group label" isCollapsible isCard>
        <Field />
    </FormGroup>
);

export const Horizontal = () => (
    <FormGroup label="Form group label" horizontal>
        <Field />
        <Field />
        <Field />
    </FormGroup>
);

export const Inline = () => (
    <FormGroup
        label="Form group label"
        inline
        errors={['This is bad', "Don't do this"]}
        helpText="Help me!"
    >
        <Field />
        <Field />
        <Field />
    </FormGroup>
);

export const Stacked = () => (
    <>
        <FormGroup label="Form group label" isCollapsible isCard className="mb-3">
            <Field />
        </FormGroup>
        <FormGroup label="Form group label" isCard className="mb-3">
            <Field />
        </FormGroup>
        <FormGroup label="Form group label" isCollapsible isCard>
            <Field />
        </FormGroup>
    </>
);

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
