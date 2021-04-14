export default {
    id: 'pages',

    label: 'Page',

    messages: {
        'name.a': 'a page',
        'name.a_plural': 'pages',
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
            fields: [
                {
                    name: 'title',
                    component: 'text',
                },
                {
                    name: 'body',
                    component: 'rich_text',
                },
            ],
        },
        create: {},
        edit: {
            title: 'Edit',
            fields: [
                {
                    name: 'title',
                    component: 'text',
                },
                {
                    name: 'body',
                    component: 'rich_text',
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
