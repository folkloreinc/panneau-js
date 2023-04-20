export default {
    id: 'pages',
    name: 'Page',

    types: [
        {
            id: 'page',
            name: 'Page',
        },
        {
            id: 'home',
            name: 'Accueil',
        },
        { id: 'contact', name: 'Contact', fields: [] },
    ],

    intl: {
        messages: {
            index: 'Voir {the_plural}',
            create: 'Ajouter une page',
            create_btn: 'Yo le jeune {a_singular}',
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
            name: 'test-select-x',
            label: 'Things',
            component: 'select',
            settings: {
                hiddenInForm: true,
            },
            options: [
                { label: 'Cool label 1', value: 1 },
                { label: 'Cool label 2', value: 2 },
                { label: 'Cool label 3', value: 3 },
            ],
        },
        {
            name: 'title',
            label: 'Titre',
            component: 'localized',
            components: {
                display: 'text-localized',
            },
            withoutFormGroup: true,
            properties: {
                fr: {
                    name: 'fr',
                    label: 'Fr',
                    component: 'text',
                },
                en: {
                    name: 'en',
                    label: 'En',
                    component: 'text',
                },
                es: {
                    name: 'es',
                    label: 'Spanish',
                    component: 'text',
                },
            },
        },
        {
            name: 'description',
            label: 'Description',
            component: 'html',
            components: {
                display: 'text',
            },
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
        {
            name: 'concept',
            label: 'Concept',
            component: 'localized',
            components: {
                display: 'html-localized',
            },
            withoutFormGroup: true,
            properties: {
                fr: {
                    name: 'fr',
                    label: 'Fr',
                    component: 'html',
                },
                en: {
                    name: 'en',
                    label: 'En',
                    component: 'html',
                },
                es: {
                    name: 'wendat',
                    label: 'Wendat',
                    component: 'html',
                },
            },
        },
        {
            name: 'upload',
            label: 'Media',
            component: 'upload',
        },
        {
            name: 'image',
            label: 'Image',
            component: 'image',
        },
        { name: 'blocks', label: 'Blocks', component: 'items' },
        {
            name: 'color',
            label: 'Color',
            component: 'color',
            defaultValue: { color: '#cc00cc', alpha: 1 },
        },
        {
            name: 'published',
            label: 'Published',
            component: 'toggle',
        },
        {
            name: 'custom-url',
            label: 'Custom url',
            component: 'url',
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

    index: {
        columns: [
            {
                id: 'title',
                sortable: true,
            },
            'slug',
            {
                id: 'actions',
                actions: [
                    // 'show',
                    {
                        id: 'export',
                        label: 'Export',
                        href: 'https://google.com',
                        external: true,
                        theme: 'secondary',
                    },
                    'edit',
                    'delete',
                ],
            },
        ],
        filters: [
            // {
            //     name: 'select-filter-chose',
            //     label: 'Catégorie',
            //     // placeholder: 'Sélectionner une catégorie', // optional
            //     component: 'select',
            //     // settings: {
            //     //     hiddenInForm: true,
            //     // },
            //     options: [
            //         { label: 'Cool label 1', value: 1 },
            //         { label: 'Cool label 2', value: 2 },
            //         { label: 'Cool label 3', value: 3 },
            //     ],
            // },
            {
                name: 'featured',
                component: 'toggle',
                label: 'Blabla blablablabla ',
                // vertical: true,
            },
            {
                name: 'custom-button',
                label: 'Button',
                component: 'button',
            },
            {
                name: 'link-button',
                label: 'External',
                component: 'button',
                href: 'https://www.google.com',
                external: true,
            },
            {
                name: 'status',
                component: 'radios',
                options: [
                    { label: 'Publié', value: 'published' },
                    { label: 'Brouillon', value: 2 },
                    { label: 'Archivé', value: 3 },
                ],
            },
            {
                name: 'q',
                placeholder: 'Rechercher',
                component: 'search',
            },
            {
                name: 'trucs',
                placeholder: 'Sélectionner un truc',
                component: 'select',
                options: [
                    { label: 'Truc 1', value: 'truc' },
                    { label: 'Truc 2', value: 'machin' },
                    { label: 'Truc 3', value: 'paul' },
                    { label: 'Truc 4!', value: 'john' },
                ],
            },
        ],
    },

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },

    columns: ['title', 'description', 'slug'],

    routes: {
        // 'resources.show': '/show',
        // 'resources.edit': '/edit',
        // 'resources.delete': '/delete',
        'resources.whatever': '/whatever-something-something',
    },
};
