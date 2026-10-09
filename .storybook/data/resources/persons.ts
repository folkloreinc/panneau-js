import type { Resource } from '@panneau/core';

import { localized, resourceValues } from '../utils';

/**
 * Team members and speakers
 *
 * Shows:
 * - an index displayed as cards instead of a table
 * - a simple resource without types
 * - a field only shown in the create form (settings.createOnly)
 */
const personsResource: Resource = {
    id: 'persons',
    name: 'Équipe',

    intl: {
        values: resourceValues({
            name: 'personne',
            singular: 'personne',
            plural: 'personnes',
            aSingular: 'une personne',
            aPlural: 'des personnes',
            theSingular: 'la personne',
            thePlural: 'l’équipe',
        }),
    },

    fields: [
        { name: 'name', label: 'Nom', component: 'text', required: true },
        localized({
            name: 'role',
            label: 'Rôle',
            component: 'text',
            display: 'text-localized',
        }),
        { name: 'email', label: 'Courriel', component: 'email' },
        {
            name: 'send_invitation',
            label: 'Envoyer une invitation par courriel',
            component: 'toggle',
            // Only in the create form
            settings: { createOnly: true },
        },
        {
            name: 'photo',
            label: 'Photo',
            component: 'image',
            withFind: true,
            components: { display: 'image' },
        },
        localized({ name: 'bio', label: 'Biographie', component: 'html' }),
    ],

    index: {
        component: 'cards',
        cardTitlePath: 'name',
        columns: [
            { id: 'photo', label: '' },
            { id: 'role' },
            { id: 'email', path: 'email' },
            {
                id: 'actions',
                actions: ['edit', 'delete'],
            },
        ],
        filters: [{ name: 'search', component: 'search', placeholder: 'Rechercher une personne' }],
    },

    settings: {
        indexIsPaginated: true,
    },
};

export default personsResource;
