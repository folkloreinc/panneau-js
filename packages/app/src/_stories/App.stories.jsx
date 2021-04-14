import React from 'react';

import PanneauContainer from '../components/Container';

import pageResource from '../../../../.storybook/data/page-resource';

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
        'resources.index': '/:resource',
        'resources.create': '/:resource/created',
        'resources.edit': '/:resource/:id/edit',
        'resources.show': '/:resource/:id',
        'resources.delete': '/:resource/:id/delete',
        // custom: {
        //     path: '/custom',
        //     component: 'custom-page',
        // },
    },

    resources: [pageResource],

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
