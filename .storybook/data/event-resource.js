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

    columns: ['organizer', 'email'],

    settings: {},
};
