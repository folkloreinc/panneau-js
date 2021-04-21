export default {
    id: 'pages',
    label: 'Page',

    has_routes: false,
    shows_in_navbar: true,

    localization: {
        messages: {},
        values: {
            a_singular: 'page',
            a_plural: 'pages',
            the_singular: 'The page',
            the_plural: 'The pages',
        },
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
                {
                    name: 'slug',
                    label: 'Slug',
                    component: 'url',
                },
                { name: 'blocks', label: 'Blocks', component: 'items' },
                {
                    name: 'color',
                    label: 'Color',
                    component: 'color',
                },
                {
                    name: 'published',
                    label: 'Published',
                    component: 'toggle',
                },
                {
                    name: 'publish_at',
                    label: 'Publish at',
                    component: 'date',
                },
            ],
        },
        create: null,
        edit: {
            title: 'Edit',
            component: 'normal',
            // fields: [
            //     {
            //         name: 'title',
            //         label: 'Titre',
            //         component: 'text',
            //     },
            //     {
            //         name: 'description',
            //         label: 'Description',
            //         component: 'html',
            //     },
            //     {
            //         name: 'slug',
            //         label: 'Slug',
            //         component: 'url',
            //     },
            // ],
        },
    },

    components: {
        index: {
            component: 'table',
        },
    },
};
