export default {
    id: 'pages',

    label: 'Page',

    messages: {
        a_singular: 'page',
        a_plural: 'pages',
    },

    fields: [{ name: 'un-texte-texte', type: 'text', component: 'text' }],

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
                    component: 'text',
                },
                {
                    name: 'body',
                    component: 'text',
                },
            ],
        },
        create: null,
        edit: {
            title: 'Edit',
            fields: [
                {
                    name: 'title',
                    component: 'text',
                },
                {
                    name: 'body',
                    component: 'text',
                },
                {
                    name: 'slug',
                    component: 'url',
                },
            ],
        },
    },

    index: {
        component: 'table',
    },
};
