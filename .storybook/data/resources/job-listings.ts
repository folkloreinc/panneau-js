import type { Resource } from '@panneau/core';

import { localized, optionsLabelDisplay, resourceValues } from '../utils';

const departments = [
    { value: 'production', label: 'Production' },
    { value: 'communications', label: 'Communications' },
    { value: 'administration', label: 'Administration' },
];

/**
 * Job listings
 *
 * Shows:
 * - grouped fields stored in an object ("fields" component -> value.details.*)
 * - batch actions: select many rows and delete them at once
 * - a two-pane form layout
 */
const jobListingsResource: Resource = {
    id: 'jobListings',
    name: 'Emplois',

    intl: {
        values: resourceValues({
            name: 'offre',
            singular: 'offre d’emploi',
            plural: 'offres d’emploi',
            aSingular: 'une offre d’emploi',
            aPlural: 'des offres d’emploi',
            theSingular: 'l’offre d’emploi',
            thePlural: 'les offres d’emploi',
        }),
    },

    fields: [
        localized({
            name: 'title',
            label: 'Titre du poste',
            component: 'text',
            display: 'text-localized',
            required: true,
        }),
        {
            name: 'details',
            label: 'Détails du poste',
            component: 'fields',
            isCard: true,
            fields: [
                {
                    name: 'department',
                    label: 'Département',
                    component: 'select',
                    options: departments,
                },
                {
                    name: 'employment_type',
                    label: 'Type d’emploi',
                    component: 'radios',
                    defaultValue: 'full_time',
                    options: [
                        { value: 'full_time', label: 'Temps plein' },
                        { value: 'contract', label: 'Contrat' },
                        { value: 'internship', label: 'Stage' },
                    ],
                },
                { name: 'location', label: 'Lieu', component: 'text' },
                { name: 'remote', label: 'Télétravail possible', component: 'toggle' },
            ],
        },
        localized({ name: 'description', label: 'Description', component: 'html' }),
        {
            name: 'deadline',
            label: 'Date limite',
            component: 'date',
            components: { display: { component: 'date', format: 'd MMMM yyyy' } },
        },
        {
            name: 'published',
            label: 'Publiée',
            component: 'toggle',
            components: { display: 'boolean' },
        },
    ],

    index: {
        component: 'table',
        columns: [
            { id: 'title' },
            {
                id: 'department',
                label: 'Département',
                path: 'details.department',
                ...optionsLabelDisplay(departments),
            },
            { id: 'location', label: 'Lieu', path: 'details.location' },
            { id: 'deadline', sortable: true },
            { id: 'published' },
            {
                id: 'actions',
                actions: ['edit', 'delete'],
            },
        ],
        batchActions: [
            {
                id: 'delete',
                component: 'delete',
                multiple: true,
            },
        ],
    },

    forms: {
        default: {
            component: 'two-pane',
        },
    },

    settings: {
        indexIsPaginated: true,
    },
};

export default jobListingsResource;
