export default {
    id: 'events',
    name: 'Event',

    localization: {
        values: {
            a_singular: 'event',
            a_plural: 'events',
        },
    },

    fields: [
        { name: 'organizer', label: 'Organisateur', type: 'text', component: 'text' },
        { name: 'email', label: 'Email', type: 'email', component: 'text' },
    ],

    components: {
        'pages.index': {
            component: 'cards',
        },
    },

    meta: {},
};
