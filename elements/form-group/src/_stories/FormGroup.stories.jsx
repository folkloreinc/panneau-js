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
