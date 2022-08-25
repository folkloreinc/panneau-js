import React from 'react';
import FormElement from '../Form';

export default {
    component: FormElement,
    title: 'Elements/Form',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <FormElement />;

export const WithStatus = () => <FormElement status="success" />;

export const WithLinks = () => (
    <FormElement
        status="success"
        actions={
            <a className="py-2 px-4" href="/link">
                Label
            </a>
        }
    />
);
