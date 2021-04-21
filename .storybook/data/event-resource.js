export default {
    id: 'events',
    label: 'Event',

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

    has_routes: false,

    shows_in_navbar: true,

    pages: {},

    forms: {},

    components: {
        index: {
            component: 'cards',
        },
    },
};
