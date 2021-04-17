export default {
    id: 'events',

    label: 'Event',

    messages: {
        a_singular: 'event',
        a_plural: 'events',
    },

    fields: [
        { name: 'organizer', label: 'Organisateur', type: 'text', component: 'text' },
        { name: 'email', label: 'Email', type: 'email', component: 'text' },
    ],

    has_routes: false,

    shows_in_navbar: true,

    pages: {
        index: {
            component: 'resource-index',
        },
        create: {
            component: 'resource-create',
        },
        edit: {
            component: 'resource-edit',
        },
    },

    forms: {
        default: {
            title: 'An event formulaire',
            fields: null,
        },
    },

    components: {
        index: {
            component: 'cards',
        },
    },
};
