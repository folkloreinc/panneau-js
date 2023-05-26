export default {
    id: 'medias',
    name: 'Media',

    intl: {
        values: {
            name: 'media',
            a_singular: 'a media',
            a_plural: 'medias',
            A_singular: 'A media',
            A_plural: 'Medias',
            the_singular: 'the media',
            the_plural: 'the medias',
            The_singular: 'The media',
            The_plural: 'The medias',
        },
    },

    fields: [
        { name: 'type', label: 'Type', type: 'string', component: 'text', disabled: true },
        { name: 'name', label: 'Name', type: 'text', component: 'text' },
        { name: 'url', label: 'Url', type: 'text', component: 'url' },
        { name: 'thumbnail_url', label: 'Thumbnail Url', type: 'text', component: 'url' },
    ],

    index: {
        component: 'table',
        columns: ['id', 'type', 'name'],
        filters: [
            {
                name: 'search',
                placeholder: 'Chercher',
                component: 'search',
            },
        ],
    },

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },
};
