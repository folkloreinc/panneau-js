import type { Message } from '@panneau/core';

interface Messages {
    index: Message;
    create: Message;
    edit: Message;
    delete: Message;
    created: Message;
    confirm_delete: Message;
    deleted: Message;
    loading: Message;
}

const messages: Messages = {
    // Resources
    index: {
        id: 'resources.index',
        defaultMessage: 'View {plural}',
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
    confirm_delete: {
        id: 'resources.confirm_delete',
        defaultMessage: 'Are you sure you want to delete item #{id}?',
    },
    deleted: {
        id: 'resources.deleted',
        defaultMessage: '{the_singular} has been deleted.',
    },
    loading: {
        id: 'resources.loading',
        defaultMessage: 'Loading {plural}...',
    },
};

export default messages;
