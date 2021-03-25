import React from 'react';

import PanneauContainer from '../components/Container';

export default {
    component: PanneauContainer,
    title: 'Packages/App',
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
        custom: {
            path: '/custom',
            component: 'custom-page',
        },
    },

    resources: [
        // resource defs
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

export const Normal = () => <PanneauContainer definition={definition} />;
