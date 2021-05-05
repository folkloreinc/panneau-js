import pageResource from './page-resource';
import eventResource from './event-resource';

export default {
    type: 'panneau',
    name: 'Panneau',

    routes: {
        home: '/',
        account: '/account',
        login: '/login',
        logout: '/logout',

        // Base routes
        'resources.index': '/:resource',
        'resources.show': '/:resource/:id',
        'resources.create': '/:resource/create',
        'resources.store': '/:resource',
        'resources.edit': '/:resource/:id/edit',
        'resources.update': '/:resource/:id',
        'resources.delete': '/:resource/:id/delete',
        'resources.destroy': '/:resource/:id',

        custom: {
            path: '/custom',
            component: 'custom-page',
        },
    },

    resources: [pageResource, eventResource],

    localization: {
        locale: 'fr',
        locales: ['fr', 'en'],
        values: {
            name: 'Panneau',
        },
        messages: {
            'resources.index': 'Lire {a_plural}',
        },
    },

    components: {
        'pages.home': 'home',
        'pages.account': 'account',
        'pages.login': {
            component: 'login',
            someProp: true,
        },
        'pages.error': 'error',
        header: { component: 'header' },
    },

    auth: {
        forgotPassword: false,
        register: true,
    },

    theme: {
        colorScheme: 'dark',
        header: {
            withMenu: false,
        },
        footer: {
            someProp: 'something',
        },
    },

    meta: {
        memoryRouter: false,
    },
};
