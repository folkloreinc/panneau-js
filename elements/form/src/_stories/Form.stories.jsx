import React from 'react';

import FormElement from '../Form';

export default {
    component: FormElement,
    title: 'Elements/Form',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <FormElement />,
};

export const WithStatus = {
    render: () => <FormElement status="success" />,
};

export const WithLinks = {
    render: () => (

    <FormElement
        status="success"
        actions={
            <a className="py-2 px-4" href="/link">
                Label
            </a>
        }
    />

    ),
};

export const CantSave = {
    render: () => (

    <FormElement
        status="error"
        canSave={false}
        actions={
            <a className="py-2 px-4" href="/link">
                Label
            </a>
        }
    />

    ),
};