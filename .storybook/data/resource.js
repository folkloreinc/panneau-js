export default {
    id: 'pages',

    name: 'Page',

    messages: {
        'name.a': 'a page',
        'name.a_plural': 'a pages',
    },

    fields: [
        {
            type: 'test',
        },
    ],

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
