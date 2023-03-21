export default {
    id: 'persons',
    name: 'Person',

    intl: {
        values: {
            name: 'person',
            a_singular: 'an person',
            a_plural: 'persons',
            A_singular: 'An person',
            A_plural: 'Persons',
            the_singular: 'the person',
            the_plural: 'the persons',
            The_singular: 'The person',
            The_plural: 'The persons',
        },
    },

    fields: [
        { name: 'name', label: 'Name', type: 'text', component: 'text' },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            component: 'text',
            components: {
                index: 'text',
            },
        },
    ],

    components: {
        'pages.index': {
            component: 'cards',
        },
    },

    index: {
        columns: ['name', 'email', 'id'],

        filters: [
            {
                name: 'search',
                placeholder: 'Chercher',
                component: 'search',
            },
            {
                name: 'trucs',
                placeholder: 'Sélectionner un truc',
                component: 'select',
                options: [
                    { label: 'Truc ZZZ', value: 'ZZZ' },
                    { label: 'Truc XXX', value: 'XXX' },
                    { label: 'Truc YYY', value: 'YYY' },
                    { label: 'Truc WWW', value: 'WWW' },
                ],
            },
        ],
    },

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },
};
