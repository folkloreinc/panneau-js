import pageResource from './page-resource';
import eventResource from './event-resource';

export default {
    name: 'Panneau',
    type: 'panneau',

    routes: {
        home: '/',
        'auth.account': '/account',
        'auth.login': '/login',
        'auth.logout': '/logout',

        //
        'resources.index': '/:resource',
        'resources.create': '/:resource/created',
        'resources.edit': '/:resource/:id/edit',
        'resources.show': '/:resource/:id',
        'resources.delete': '/:resource/:id/delete',

        // Api routes fix this
        'resources.list': '/:resource',
        'resources.store': '/:resource',
        'resources.get': '/:resource/:id',
        'resources.update': '/:resource/:id',

        // custom: {
        //     path: '/custom',
        //     component: 'custom-page',
        // },
    },

    resources: [pageResource, eventResource],

    pages: {
        home: {
            component: 'home',
        },
        account: {
            component: 'account',
        },
        login: {
            component: 'login',
        },
        error: {
            component: 'error',
        },
    },

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
