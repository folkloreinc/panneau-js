import { defineMessages } from 'react-intl';

const messages = defineMessages({
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
        defaultMessage: '{The_singular} has been created.',
    },
    deleted: {
        id: 'resources.deleted',
        defaultMessage: '{The_singular} has been deleted.',
    },
    loading: {
        id: 'resources.loading',
        defaultMessage: 'Loading {plural}...',
    },
});

export default messages;
