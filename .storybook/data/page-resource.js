export default {
    id: 'pages',

    label: 'Page',

    messages: {
        a_singular: 'page',
        a_plural: 'pages',
    },

    fields: [{ name: 'title', label: 'Titre', component: 'text' }],

    has_routes: false,
    shows_in_navbar: true,

    pages: {
        index: {
            component: 'resource-index',
        },
        create: {
            component: 'resource-create',
        },
        edit: {
            component: 'resource-edit',
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
