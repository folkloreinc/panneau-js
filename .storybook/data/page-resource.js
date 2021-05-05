export default {
    id: 'pages',
    name: 'Page',

    types: [{ id: 'contact', name: 'Contact', fields: [] }],

    localization: {
        messages: {
            'resource.index': 'Voir {the_plural}',
            'resource.create_button': 'Yo le jeune',
        },
        values: {
            name: 'page',
            a_singular: 'une page',
            a_plural: 'des pages',
            A_singular: 'Une page',
            A_plural: 'pages',
            the_singular: 'la page',
            the_plural: 'les pages',
            The_singular: 'The page',
            The_plural: 'The pages',
        },
    },

    fields: [
        {
            name: 'title',
            label: 'Titre',
            component: 'text-localized',
            components: {
                index: 'text-localized',
            },
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
            settings: {
                showInIndex: true,
                createOnly: true,
            },
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

    components: {
        'pages.index': 'resource-index',
        'pages.show': {
            component: 'resource-show',
        },
        'pages.create': {
            component: 'resource-create',
        },
        'pages.edit': {
            component: 'resource-edit',
        },
        'pages.delete': {
            component: 'resource-delete',
        },
        'forms.default': 'custom-form',
        'forms.edit': {
            title: 'Edit',
            component: 'normal',
        },
    },

    meta: {
        hideInNavbar: false,
    },

    columns: ['title', 'description'],

    routes: {
        'resource.create': '/kfgsakhfg',
    },
};
