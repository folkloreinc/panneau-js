import React from 'react';

import PanneauContainer from '../components/Container';

export default {
    component: PanneauContainer,
    title: 'App',
    parameters: {
        intl: true,
    },
};

const definition = {
    type: 'panneau',

    routes: {
        home: '/',
        'auth.login': '/login',
        'auth.logout': '/logout',
        'resource.index': '/:resource',
        'resource.create': '/:resource/created',
        'resource.edit': '/:resource/:id/edit',
        'resource.show': '/:resource/:id',
        'resource.delete': '/:resource/:id/delete',
        // custom: {
        //     path: '/custom',
        //     component: 'custom-page',
        // },
    },

    resources: [
        // resource defs
        {
            id: 'pages',
            type: 'pages',
            label: 'Pages',
        },
    ],

    auth: {
        forgot_password: false,
    },

    theme: {
        component: 'dark_mode',
        header: {
            component: '',
            with_menu: false,
        },
        footer: {},
    },
};

export const Normal = () => <PanneauContainer definition={definition} memoryRouter />;

export const WithUser = () => (
    <PanneauContainer
        definition={definition}
        memoryRouter
        user={{ id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' }}
    />
);
