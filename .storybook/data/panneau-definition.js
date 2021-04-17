import pageResource from './page-resource';
import eventResource from './event-resource';

export default {
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

        // Api routes
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
