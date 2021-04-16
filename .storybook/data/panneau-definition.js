import pageResource from './page-resource';

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
