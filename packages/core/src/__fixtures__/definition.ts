import { Definition, type DefinitionInput, type Resource } from '@panneau/protocol';

export function createDefinitionInput(): DefinitionInput {
    return {
        protocol: 1,
        name: 'Test site',
        locale: 'en',
        locales: ['en', 'fr'],
        api: { baseUrl: '/panneau/api' },
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                fields: [
                    { name: 'slug', type: 'slug', createOnly: true },
                    {
                        name: 'title',
                        type: 'text',
                        label: 'Title',
                        localized: true,
                        rules: [{ rule: 'required' }, { rule: 'max', value: 20 }],
                    },
                    {
                        name: 'status',
                        type: 'select',
                        default: 'draft',
                        options: [
                            { value: 'draft', label: 'Draft' },
                            { value: 'published', label: 'Published' },
                        ],
                        rules: [{ rule: 'required' }],
                    },
                    {
                        name: 'published_at',
                        type: 'datetime',
                        label: 'Published at',
                        display: 'date',
                        visibleWhen: { field: 'status', equals: 'published' },
                        rules: [{ rule: 'required' }],
                    },
                    {
                        name: 'seo',
                        type: 'group',
                        fields: [
                            {
                                name: 'description',
                                type: 'textarea',
                                rules: [{ rule: 'max', value: 10 }],
                            },
                        ],
                    },
                    { name: 'views', type: 'number', updateOnly: true, readOnly: true },
                    { name: 'body', type: 'richtext' },
                ],
                form: {
                    layout: [
                        {
                            type: 'tabs',
                            children: [
                                {
                                    type: 'tab',
                                    label: 'Content',
                                    children: [
                                        { type: 'field', name: 'title' },
                                        { type: 'field', name: 'removed' },
                                    ],
                                },
                                {
                                    type: 'tab',
                                    label: 'Publication',
                                    children: [
                                        { type: 'field', name: 'status' },
                                        {
                                            type: 'section',
                                            visibleWhen: { field: 'status', equals: 'published' },
                                            children: [{ type: 'field', name: 'published_at' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                list: {
                    columns: [
                        { field: 'title' },
                        { field: 'published_at', sortable: false },
                        { id: 'preview', label: 'Preview', display: 'link', align: 'end' },
                    ],
                    filters: [{ id: 'status', type: 'select' }],
                    sorts: ['title', 'published_at'],
                    defaultSort: '-published_at,title',
                    perPage: 10,
                    search: true,
                },
                actions: [
                    {
                        id: 'edit',
                        label: 'Edit',
                        kind: 'link',
                        url: '/pages/{id}',
                        scope: ['item'],
                    },
                    { id: 'publish', label: 'Publish', scope: ['item', 'selection'] },
                    {
                        id: 'export',
                        label: 'Export',
                        scope: ['selection', 'resource'],
                        placement: ['menu'],
                    },
                    { id: 'purge', label: 'Purge', scope: ['resource'], abilities: { run: false } },
                ],
                abilities: { viewAny: true, create: false },
            },
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                types: [
                    { id: 'guest', label: 'Guest', fields: [{ name: 'website', type: 'url' }] },
                ],
                fields: [
                    { name: 'name', type: 'text', rules: [{ rule: 'required' }] },
                    { name: 'bio', type: 'richtext' },
                    { name: 'tags', type: 'repeater' },
                    { name: 'email', type: 'email' },
                    { name: 'phone', type: 'text' },
                    { name: 'city', type: 'text' },
                    { name: 'country', type: 'text' },
                ],
            },
        ],
    };
}

/** The test definition, parsed (with defaults applied). */
export function createDefinition(): Definition {
    return Definition.parse(createDefinitionInput());
}

export function getResource(id: string): Resource {
    const resource = createDefinition().resources.find((candidate) => candidate.id === id);
    if (resource === undefined) {
        throw new Error(`No resource ${id}.`);
    }
    return resource;
}
