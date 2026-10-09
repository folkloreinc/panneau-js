import type { Resource } from '@panneau/core';

import { resourceValues } from '../utils';

/**
 * Medias library
 *
 * Used by the app and by the medias browser/picker (packages/medias), which read
 * `index.columns`, `index.filters` and `fields` of this resource.
 */
const mediasResource: Resource = {
    id: 'medias',
    name: 'Médias',

    intl: {
        values: resourceValues({
            name: 'média',
            singular: 'média',
            plural: 'médias',
            aSingular: 'un média',
            aPlural: 'des médias',
            theSingular: 'le média',
            thePlural: 'les médias',
        }),
    },

    fields: [
        {
            name: 'thumbnail_url',
            label: 'Aperçu',
            component: 'display',
            display: 'image',
            maxWidth: 200,
            maxHeight: 200,
            components: { display: 'image' },
        },
        {
            name: 'name',
            label: 'Nom',
            component: 'text',
            components: { display: { component: 'text-description', descriptionPath: 'type' } },
        },
        {
            name: 'type',
            label: 'Type',
            component: 'select',
            disabled: true,
            options: [
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Vidéo' },
                { value: 'audio', label: 'Audio' },
            ],
            components: { display: 'select' },
        },
        { name: 'url', label: 'URL', component: 'url', disabled: true },
    ],

    index: {
        component: 'table',
        columns: [
            { id: 'thumbnail_url', label: '' },
            { id: 'name', sortable: true },
            { id: 'type' },
            {
                id: 'actions',
                actions: ['edit', 'delete'],
            },
        ],
        filters: [
            { name: 'search', component: 'search', placeholder: 'Rechercher un média' },
            {
                name: 'types',
                component: 'select',
                placeholder: 'Tous les types',
                multiple: true,
                options: [
                    { value: 'image', label: 'Images' },
                    { value: 'video', label: 'Vidéos' },
                    { value: 'audio', label: 'Audio' },
                ],
            },
        ],
    },

    settings: {
        indexIsPaginated: true,
    },
};

export default mediasResource;
