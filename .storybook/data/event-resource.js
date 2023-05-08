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
            name: 'page',
            label: 'Page',
            type: 'item',
            component: 'item',
            itemLabelPath: 'title.fr',
            itemLabelWithId: true,
            requestUrl: '/pages',
            requestQuery: { paginated: false },
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            component: 'text',
            components: {
                index: 'text',
            },
        },
        { name: 'blocks', label: 'Blocks', component: 'items', withoutFormGroup: true },
    ],

    components: {
        'pages.index': {
            component: 'cards',
        },
    },

    index: {
        columns: [
            'organizer',
            'email',
            {
                id: 'actions',
                actions: [
                    'show',
                    'edit',
                    'delete',
                    {
                        id: 'export',
                        icon: 'gear',
                        href: 'https://google.com',
                        external: true,
                        theme: 'secondary',
                        className: 'me-1',
                        itemLinkProp: 'email',
                    },
                ],
            },
        ],

        actions: [
            {
                id: 'export',
                label: 'Export',
                href: 'https://google.com',
                external: true,
                theme: 'secondary',
                className: 'me-1',
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
                    { label: 'Truc A', value: 'A' },
                    { label: 'Truc B', value: 'B' },
                    { label: 'Truc C', value: 'C' },
                    { label: 'Truc D', value: 'D' },
                ],
            },
        ],
    },

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },
};
