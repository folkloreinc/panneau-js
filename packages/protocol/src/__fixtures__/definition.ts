import type { DefinitionInput } from '../schemas';

/** A small but complete definition, used across the tests. */
export function createDefinition(): DefinitionInput {
    return {
        protocol: 1,
        name: 'Test site',
        locale: 'fr',
        locales: ['fr', 'en'],
        api: { baseUrl: '/panneau/api' },
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                fields: [
                    {
                        name: 'title',
                        type: 'text',
                        label: 'Titre',
                        localized: true,
                        rules: [{ rule: 'required' }, { rule: 'max', value: 120 }],
                    },
                    {
                        name: 'status',
                        type: 'select',
                        options: [
                            { value: 'draft', label: 'Brouillon' },
                            { value: 'published', label: 'Publiée' },
                        ],
                        rules: [
                            { rule: 'required' },
                            { rule: 'in', value: ['draft', 'published'] },
                        ],
                    },
                    {
                        name: 'published_at',
                        type: 'datetime',
                        visibleWhen: { field: 'status', equals: 'published' },
                        rules: [{ rule: 'required' }],
                    },
                    { name: 'author', type: 'relation', resource: 'authors' },
                    {
                        name: 'blocks',
                        type: 'repeater',
                        types: [
                            {
                                id: 'text',
                                label: 'Texte',
                                fields: [
                                    {
                                        name: 'body',
                                        type: 'richtext',
                                        rules: [{ rule: 'required' }],
                                    },
                                ],
                            },
                            {
                                id: 'image',
                                label: 'Image',
                                fields: [
                                    {
                                        name: 'image',
                                        type: 'media',
                                        rules: [
                                            { rule: 'accept', value: ['image/*'] },
                                            { rule: 'maxSize', value: 1000 },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                form: {
                    layout: [
                        {
                            type: 'tabs',
                            children: [
                                {
                                    type: 'tab',
                                    label: 'Contenu',
                                    children: [
                                        {
                                            type: 'row',
                                            children: [
                                                { type: 'field', name: 'title', width: 8 },
                                                { type: 'field', name: 'status', width: 4 },
                                            ],
                                        },
                                        { type: 'field', name: 'blocks' },
                                    ],
                                },
                            ],
                        },
                        { type: 'sidebar', children: [{ type: 'field', name: 'published_at' }] },
                    ],
                },
                list: {
                    columns: [
                        { field: 'title', sortable: true },
                        { field: 'status' },
                        { id: 'updated' },
                    ],
                    filters: [{ id: 'status', type: 'select' }],
                    sorts: ['title', 'published_at'],
                    defaultSort: 'title',
                    perPage: 20,
                    search: true,
                },
                actions: [
                    {
                        id: 'publish',
                        label: 'Publier',
                        scope: ['item', 'selection'],
                        placement: ['row', 'toolbar'],
                        confirm: { message: 'Publier {count} pages ?' },
                        fields: [{ name: 'notify', type: 'boolean' }],
                    },
                    {
                        id: 'edit',
                        label: 'Modifier',
                        kind: 'link',
                        url: '/pages/{id}/edit',
                        scope: ['item'],
                    },
                ],
                abilities: { viewAny: true, create: true },
            },
            {
                id: 'authors',
                label: { singular: 'auteur', plural: 'auteurs' },
                fields: [{ name: 'name', type: 'text', rules: [{ rule: 'required' }] }],
            },
        ],
        menus: { main: [{ type: 'resources' }, { type: 'link', label: 'Site', url: '/' }] },
        auth: { mode: 'panneau', password: true, providers: [{ id: 'google', label: 'Google' }] },
    };
}
