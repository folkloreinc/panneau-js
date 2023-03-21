import eventResource from './event-resource';
import pageResource from './page-resource';
import personResource from './person-resource';

export default {
    type: 'panneau',
    name: 'Panneau',

    routes: {
        home: '/',
        'auth.login': '/login',
        'auth.logout': '/logout',
        account: '/account',

        // Base routes
        'resources.index': '/:resource', // the page
        'resources.show': '/:resource/:id', // the page
        'resources.create': '/:resource/create', // the page
        'resources.store': '/:resource', // the json call
        'resources.edit': '/:resource/:id/edit', // the page
        'resources.update': '/:resource/:id', // the json call
        'resources.delete': '/:resource/:id/delete', // the page
        'resources.destroy': '/:resource/:id', // the json call

        custom: {
            path: '/custom',
            component: 'custom-page',
        },
    },

    resources: [pageResource, eventResource, personResource],

    menus: {
        main: [
            {
                label: 'test',
                href: '/custom',
            },
            'separator',
            {
                label: 'test2',
                href: '/custom',
            },
        ],
    },

    intl: {
        locale: 'fr',
        locales: ['fr', 'en', 'es'],
        values: {
            name: 'Panneau',
        },
        messages: {
            'resources.index': 'Lire {a_plural}',
            'resources.create': 'Blabla',
        },
    },

    components: {
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

    settings: {
        memoryRouter: false,
    },
};
