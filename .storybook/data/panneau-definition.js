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

        // Base routes
        'resources.index': '/:resource',
        'resources.show': '/:resource/:id',
        'resources.create': '/:resource/create',
        'resources.edit': '/:resource/:id/edit',
        'resources.delete': '/:resource/:id/delete',

        // Api routes to avoid confusion
        'resources.api.list': '/:resource',
        'resources.api.get': '/:resource/:id',
        'resources.api.store': '/:resource',
        'resources.api.update': '/:resource/:id',
        'resources.api.destroy': '/:resource/:id',

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
            show_button: {
                id: 'form.show_button',
                defaultMessage: 'Cancel',
            },
            edit_button: {
                id: 'form.edit_button',
                defaultMessage: 'Edit',
            },
            cancel_button: {
                id: 'form.cancel_button',
                defaultMessage: 'Cancel',
            },
            delete_button: {
                id: 'form.delete_button',
                defaultMessage: 'Delete',
            },
            login: {
                id: 'auth.login',
                defaultMessage: 'Login',
            },
            logout: {
                id: 'auth.logout',
                defaultMessage: 'Logout',
            },
            account: {
                id: 'auth.account',
                defaultMessage: 'Account',
            },
            updateAccount: {
                id: 'auth.update_account',
                defaultMessage: 'Update account',
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
