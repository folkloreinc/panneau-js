import type { Resource } from '@panneau/core';

import { localized, optionsLabelDisplay, resourceValues } from '../utils';

import { blocksField } from '../blocks';

/**
 * Pages of a website
 *
 * Shows:
 * - typed resource: each type (page, home, contact) adds its own fields and the
 *   "create" button becomes a dropdown (/pages/create?type=home)
 * - localized fields (fr/en), html, image, blocks (items field with block types)
 * - table index with filters (search, select, radios), sortable columns and row actions
 */

const pageTypes = [
    { value: 'page', label: 'Page standard' },
    { value: 'home', label: 'Accueil' },
    { value: 'contact', label: 'Contact' },
];

const baseFields = [
    localized({
        name: 'title',
        label: 'Titre',
        component: 'text',
        display: 'text-localized',
        required: true,
    }),
    {
        name: 'slug',
        label: 'Slug',
        component: 'text',
        helpText: 'Utilisé dans l’URL de la page (ex: /a-propos)',
        required: true,
    },
    localized({ name: 'description', label: 'Description', component: 'textarea' }),
    {
        name: 'image',
        label: 'Image de partage',
        component: 'image',
        withFind: true,
        components: { display: 'image' },
    },
];

const publicationFields = [
    {
        name: 'published',
        label: 'Publiée',
        component: 'toggle',
        components: { display: 'boolean' },
    },
    {
        name: 'publish_at',
        label: 'Date de publication',
        component: 'date-time',
        components: { display: { component: 'date', format: 'd MMM yyyy' } },
    },
];

const pagesResource: Resource = {
    id: 'pages',
    name: 'Pages',

    intl: {
        values: resourceValues({
            name: 'page',
            singular: 'page',
            plural: 'pages',
            aSingular: 'une page',
            aPlural: 'des pages',
            theSingular: 'la page',
            thePlural: 'les pages',
        }),
    },

    types: [
        {
            id: 'page',
            name: 'Page standard',
            fields: [...baseFields, blocksField(), ...publicationFields],
        },
        {
            id: 'home',
            name: 'Accueil',
            fields: [
                ...baseFields,
                {
                    name: 'hero',
                    label: 'Bannière',
                    component: 'fields',
                    isCard: true,
                    fields: [
                        localized({ name: 'title', label: 'Titre', component: 'text' }),
                        localized({ name: 'button_label', label: 'Bouton', component: 'text' }),
                        { name: 'button_url', label: 'Lien du bouton', component: 'url' },
                    ],
                },
                blocksField(),
                ...publicationFields,
            ],
            // Only one home page: it can't be created from the interface
            settings: {
                canCreate: false,
            },
        },
        {
            id: 'contact',
            name: 'Contact',
            fields: [
                ...baseFields,
                {
                    name: 'contact',
                    label: 'Coordonnées',
                    component: 'fields',
                    isCard: true,
                    fields: [
                        { name: 'email', label: 'Courriel', component: 'email' },
                        { name: 'phone', label: 'Téléphone', component: 'telephone' },
                        { name: 'address', label: 'Adresse', component: 'textarea' },
                    ],
                },
                ...publicationFields,
            ],
        },
    ],

    // Fields used when there is no type, and to display the columns of the index
    // (columns are merged with the fields by name)
    fields: [...baseFields, blocksField(), ...publicationFields],

    index: {
        component: 'table',
        striped: true,
        columns: [
            { id: 'id', label: '#', path: 'id', sortable: true },
            { id: 'image', path: 'image', label: '' },
            { id: 'title', sortable: true },
            { id: 'type', label: 'Type', path: 'type', ...optionsLabelDisplay(pageTypes) },
            { id: 'slug', path: 'slug', label: 'Slug' },
            { id: 'published' },
            { id: 'publish_at', sortable: true },
            {
                id: 'actions',
                actions: ['show', 'edit', 'duplicate', 'delete'],
            },
        ],
        filters: [
            {
                name: 'search',
                component: 'search',
                placeholder: 'Rechercher une page',
            },
            {
                name: 'type',
                component: 'select',
                placeholder: 'Tous les types',
                options: pageTypes,
            },
            {
                name: 'published',
                component: 'radios',
                options: [
                    { value: 'true', label: 'Publiées' },
                    { value: 'false', label: 'Brouillons' },
                ],
            },
        ],
    },

    forms: {
        default: {
            component: 'normal',
        },
    },

    settings: {
        indexIsPaginated: true,
    },
};

export default pagesResource;
