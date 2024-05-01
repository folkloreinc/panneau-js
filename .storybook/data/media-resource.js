import actions from './actions';

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
        {
            name: 'image',
            label: 'Image',
            component: 'image',
        },
        {
            name: 'name',
            label: 'Name',
            type: 'string',
            component: 'text-description',
            descriptionPath: 'type',
        },
        { name: 'url', label: 'Url', type: 'text', component: 'url', disabled: true },
        {
            name: 'thumbnail_url',
            label: 'Thumbnail Url',
            type: 'object',
            component: 'image',
            display: 'link',
            labelPath: 'name',
        },
        {
            name: 'thumbnail_url',
            label: 'Thumbnail Url',
            type: 'text',
            component: 'display',
            display: 'link',
            labelPath: 'name',
        },
    ],

    index: {
        component: 'table',
        columns: ['id', 'type', 'name'],
        batchActions: actions,
        filters: [
            {
                name: 'search',
                placeholder: 'Chercher',
                component: 'search',
            },
            {
                name: 'types',
                placeholder: 'Sélectionner un type',
                component: 'select',
                multiple: true,
                options: [
                    { label: 'image 1', value: 'image' },
                    { label: 'audio 2', value: 'audio' },
                    { label: 'video 3', value: 'video' },
                ],
            },
            {
                name: 'persons',
                placeholder: 'Sélectionner une personne',
                component: 'select',
                multiple: true,
                requestUrl: '/api/persons',
                itemLabelPath: 'name',
                paginated: false,
                autoSize: false,
            },
        ],
    },

    settings: {
        hideInNavbar: false,
        indexIsPaginated: true,
    },
};
