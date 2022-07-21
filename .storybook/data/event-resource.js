export default {
    id: 'events',
    name: 'Event',

    intl: {
        values: {
            name: 'event',
            a_singular: 'an event',
            a_plural: 'events',
            A_singular: 'An event',
            A_plural: 'Events',
            the_singular: 'the event',
            the_plural: 'the events',
            The_singular: 'The event',
            The_plural: 'The events',
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

        actions: [
            {
                id: 'export',
                label: 'Export',
            },
            'create',
        ],

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

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },
};
