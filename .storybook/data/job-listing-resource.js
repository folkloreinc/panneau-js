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
    ],

    index: {
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
