export default {
    id: 'events',
    name: 'Event',

    intl: {
        values: {
            a_singular: 'event',
            a_plural: 'events',
        },
    },

    fields: [
        { name: 'organizer', label: 'Organisateur', type: 'text', component: 'text' },
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
        columns: ['organizer', 'email'],

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
                    { label: 'Truc 1', value: 1 },
                    { label: 'Truc 2', value: 2 },
                    { label: 'Truc 3', value: 3 },
                    { label: 'Truc 4!', value: 4 },
                ],
            },
        ],
    },

    settings: {},
};
