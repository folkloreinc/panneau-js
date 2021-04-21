import pageResource from './page-resource';
import eventResource from './event-resource';

export default {
    type: 'panneau',
    label: 'Panneau',

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

    localization: {
        messages: {
            index: {
                id: 'resources.index',
                defaultMessage: 'View {a_plural}',
            },
            create: {
                id: 'resources.create',
                defaultMessage: 'Create {a_singular}',
            },
            edit: {
                id: 'resources.edit',
                defaultMessage: 'Edit {a_singular}',
            },
            delete: {
                id: 'resources.delete',
                defaultMessage: 'Delete {a_singular}',
            },
            created: {
                id: 'resources.created',
                defaultMessage: '{the_singular} has been created.',
            },
            deleted: {
                id: 'resources.deleted',
                defaultMessage: '{the_singular} has been deleted.',
            },
            loading: {
                id: 'resources.loading',
                defaultMessage: 'Loading {plural}...',
            },
            login_title: {
                id: 'auth.login.title',
                defaultMessage: 'Login',
            },
            confirm_delete: {
                id: 'form.confirm_delete',
                defaultMessage: 'Are you sure you want to delete item #{id}?',
            },
            cancel_button: {
                id: 'form.cancel_button',
                defaultMessage: 'Cancel',
            },
            delete_button: {
                id: 'form.delete_button',
                defaultMessage: 'Delete',
            },
        },
    },

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
