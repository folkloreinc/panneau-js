export default {
    id: 'pages',
    label: 'Page',

    has_routes: false,
    shows_in_navbar: true,

    messages: {
        a_singular: 'page',
        a_plural: 'pages',
    },

    fields: [{ name: 'title', label: 'Titre', component: 'text' }],

    // Can be switched
    pages: {
        index: {
            component: 'resource-index',
        },
        show: {
            component: 'resource-show',
        },
        create: {
            component: 'resource-create',
        },
        edit: {
            component: 'resource-edit',
        },
        delete: {
            component: 'resource-delete',
        },
    },

    forms: {
        default: {
            title: 'Default form',
            fields: [
                {
                    name: 'title',
                    label: 'Titre',
                    component: 'text',
                },
                {
                    name: 'description',
                    label: 'Description',
                    component: 'html',
                },
            ],
        },
        create: null,
        edit: {
            title: 'Edit',
            fields: [
                {
                    name: 'title',
                    label: 'Titre',
                    component: 'text',
                },
                {
                    name: 'description',
                    label: 'Description',
                    component: 'html',
                },
                {
                    name: 'slug',
                    label: 'Slug',
                    component: 'url',
                },
            ],
        },
    },

    components: {
        index: {
            component: 'table',
        },
    },
};
