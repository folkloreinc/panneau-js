import { defineMessages } from 'react-intl';

export default defineMessages({
    // Resources
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

    // Forms
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
    // Auth

    login_title: {
        id: 'auth.login.title',
        defaultMessage: 'Login',
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
});
