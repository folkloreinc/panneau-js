import type { Resource } from '@panneau/core';

import { localized, optionsLabelDisplay, resourceValues } from '../utils';

const categories = [
    { value: 'concert', label: 'Concert' },
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'exhibition', label: 'Exposition' },
];

/**
 * Events of a festival
 *
 * Shows:
 * - relations to other resources with the "resource-item" field (one page, many persons)
 * - dates, number, select, toggle and url fields
 * - custom header actions (an external link + the create button)
 * - a badges column for a list of related items
 */
const eventsResource: Resource = {
    id: 'events',
    name: 'Événements',

    intl: {
        values: resourceValues({
            name: 'événement',
            singular: 'événement',
            plural: 'événements',
            aSingular: 'un événement',
            aPlural: 'des événements',
            theSingular: 'l’événement',
            thePlural: 'les événements',
        }),
    },

    fields: [
        localized({
            name: 'title',
            label: 'Titre',
            component: 'text',
            display: 'text-localized',
            required: true,
        }),
        {
            name: 'category',
            label: 'Catégorie',
            component: 'select',
            required: true,
            options: categories,
            components: { display: optionsLabelDisplay(categories) },
        },
        {
            name: 'starts_at',
            label: 'Début',
            component: 'date-time',
            required: true,
            components: { display: { component: 'date', format: 'd MMM yyyy, HH:mm' } },
        },
        {
            name: 'ends_at',
            label: 'Fin',
            component: 'date-time',
        },
        { name: 'venue', label: 'Lieu', component: 'text' },
        localized({ name: 'description', label: 'Description', component: 'html' }),
        {
            name: 'image',
            label: 'Image',
            component: 'image',
            withFind: true,
            components: { display: 'image' },
        },
        {
            name: 'speakers',
            label: 'Intervenants',
            component: 'resource-item',
            resource: 'persons',
            multiple: true,
            canFind: true,
            canCreate: true,
            itemLabelPath: 'name',
            components: { display: { component: 'badges', itemLabelPath: 'name' } },
        },
        {
            name: 'page',
            label: 'Page associée',
            component: 'resource-item',
            resource: 'pages',
            canFind: true,
            itemLabelPath: 'title.fr',
            helpText: 'La page du site où l’événement est présenté',
        },
        {
            name: 'price',
            label: 'Prix ($)',
            component: 'number',
        },
        {
            name: 'registration_url',
            label: 'Lien de la billetterie',
            component: 'url',
        },
        {
            name: 'featured',
            label: 'En vedette',
            component: 'toggle',
            components: { display: 'boolean' },
        },
        {
            name: 'published',
            label: 'Publié',
            component: 'toggle',
            components: { display: 'boolean' },
        },
    ],

    index: {
        component: 'table',
        columns: [
            { id: 'image', path: 'image', label: '' },
            { id: 'title', sortable: true },
            { id: 'category' },
            { id: 'starts_at', sortable: true },
            { id: 'venue', path: 'venue', label: 'Lieu' },
            { id: 'speakers' },
            { id: 'price' },
            { id: 'featured' },
            {
                id: 'actions',
                actions: ['edit', 'duplicate', 'delete'],
            },
        ],
        // Header actions (replace the default "create" button)
        actions: [
            {
                id: 'program',
                label: 'Voir la programmation',
                href: 'https://example.com/programmation',
                external: true,
                theme: 'secondary',
                outline: true,
                className: 'me-2',
            },
            'create',
        ],
        filters: [
            { name: 'search', component: 'search', placeholder: 'Rechercher un événement' },
            {
                name: 'category',
                component: 'select',
                placeholder: 'Toutes les catégories',
                options: categories,
            },
            { name: 'featured', component: 'toggle', label: 'En vedette' },
        ],
    },

    settings: {
        indexIsPaginated: true,
    },
};

export default eventsResource;
