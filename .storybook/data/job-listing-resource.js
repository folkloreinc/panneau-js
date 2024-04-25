export default {
    id: 'jobListings',
    name: 'Job listings',

    types: null,

    intl: {
        messages: {
            index: 'Voir {the_plural}',
            create: 'Ajouter une jobbe',
            create_btn: 'Yo le jeune {a_singular}',
        },
        values: {
            name: 'job',
            a_singular: 'une job',
            a_plural: 'des jobs',
            A_singular: 'Une job',
            A_plural: 'jobs',
            the_singular: 'la job',
            the_plural: 'les jobs',
            The_singular: 'The job',
            The_plural: 'The jobs',
        },
    },

    fields: [
        {
            name: 'description',
            label: 'Description',
            component: 'html',
            components: {
                display: 'text',
            },
        },
        {
            name: 'color_patterns',
            label: 'Colors',
            component: 'fields',
            isCard: true,
            isCollapsible: false,
            required: false,
            fields: [
                {
                    name: 'test-select-color-number',
                    label: 'Things strings',
                    component: 'select',
                    type: 'string',
                    settings: {
                        hiddenInForm: true,
                    },
                    required: true,
                    defaultValue: 2,
                    options: [
                        { label: 'Cool color 1', value: 1 },
                        { label: 'Cool color 2', value: 2 },
                        { label: 'Cool color 3', value: 3 },
                    ],
                },
                {
                    name: 'test-select-color-letter',
                    label: 'Things numeric',
                    component: 'select',
                    type: 'string',
                    settings: {
                        hiddenInForm: true,
                    },
                    defaultValue: 'C',
                    options: [
                        { label: 'Cool color A', value: 'A' },
                        { label: 'Cool color B', value: 'B' },
                        { label: 'Cool color C', value: 'C' },
                    ],
                },
                {
                    name: 'color',
                    label: 'Color',
                    component: 'color',
                    // defaultValue: { color: '#cc00cc', alpha: 1 },
                },
                {
                    name: 'date',
                    label: 'Date',
                    component: 'date',
                },
            ],
        },
    ],

    index: {
        batchActions: [
            {
                id: 'delete',
                component: 'delete',
                multiple: false,
            },
        ],
        columns: [
            {
                id: 'description',
                sortable: false,
            },
        ],
        filters: [],
    },

    settings: {
        canCreate: true,
        hideInNavbar: false,
        indexIsPaginated: true,
    },

    columns: ['description', 'slug'],
};
