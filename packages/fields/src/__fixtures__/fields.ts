import type { Field } from '@panneau/protocol';

import type { RelationReference, RelationSource } from '../shared/relation';

/** One field of every built-in type, for stories and tests. */
export const EXAMPLE_FIELDS: Field[] = [
    {
        name: 'title',
        type: 'text',
        label: 'Title',
        help: 'Shown in search results.',
        localized: true,
        rules: [{ rule: 'required' }, { rule: 'max', value: 80 }],
    },
    {
        name: 'slug',
        type: 'slug',
        label: 'Slug',
        from: 'title',
        settings: { prefix: '/episodes/' },
    },
    { name: 'summary', type: 'textarea', label: 'Summary', rules: [{ rule: 'max', value: 280 }] },
    {
        name: 'duration',
        type: 'duration',
        label: 'Duration',
        help: 'Hours, minutes and seconds.',
    },
    {
        name: 'season',
        type: 'number',
        label: 'Season',
        rules: [{ rule: 'min', value: 1 }],
    },
    { name: 'members_only', type: 'boolean', label: 'Members only' },
    { name: 'comments', type: 'boolean', label: 'Comments', settings: { widget: 'switch' } },
    { name: 'published_on', type: 'date', label: 'Published on' },
    { name: 'published_at', type: 'datetime', label: 'Published at' },
    { name: 'starts_at', type: 'time', label: 'Starts at' },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
        ],
        rules: [{ rule: 'required' }],
    },
    {
        name: 'format',
        type: 'select',
        label: 'Format',
        options: [
            { value: 'square', label: 'Square', description: '1:1' },
            { value: 'portrait', label: 'Portrait', description: '4:5' },
            { value: 'story', label: 'Story', description: '9:16' },
        ],
        settings: { widget: 'radios' },
    },
    {
        name: 'platforms',
        type: 'select',
        label: 'Platforms',
        multiple: true,
        options: [
            { value: 'web', label: 'Web' },
            { value: 'ios', label: 'iOS' },
            { value: 'android', label: 'Android' },
        ],
        settings: { widget: 'checkboxes' },
    },
    { name: 'contact', type: 'email', label: 'Contact email' },
    { name: 'website', type: 'url', label: 'Website' },
    { name: 'accent', type: 'color', label: 'Accent color' },
    { name: 'phone', type: 'tel', label: 'Phone' },
    {
        name: 'rating',
        type: 'range',
        label: 'Rating',
        rules: [
            { rule: 'min', value: 0 },
            { rule: 'max', value: 10 },
        ],
        settings: { step: 0.5, suffix: '/ 10' },
    },
    {
        name: 'topics',
        type: 'tags',
        label: 'Topics',
        options: [
            { value: 'culture', label: 'Culture' },
            { value: 'food', label: 'Food' },
            { value: 'outdoors', label: 'Outdoors' },
        ],
    },
    { name: 'metadata', type: 'json', label: 'Metadata', settings: { rows: 5 } },
    { name: 'author', type: 'relation', label: 'Author', resource: 'authors' },
    { name: 'guests', type: 'relation', label: 'Guests', resource: 'authors', multiple: true },
    {
        name: 'transcript',
        type: 'file',
        label: 'Transcript',
        rules: [{ rule: 'accept', value: ['application/pdf', 'text/*'] }],
    },
    {
        name: 'sharing',
        type: 'group',
        label: 'Sharing',
        fields: [
            { name: 'title', type: 'text', label: 'Share title' },
            { name: 'custom_image', type: 'boolean', label: 'Custom image' },
            {
                name: 'image_note',
                type: 'text',
                label: 'Image note',
                visibleWhen: { field: 'custom_image', equals: true },
            },
        ],
    },
    {
        name: 'blocks',
        type: 'repeater',
        label: 'Blocks',
        types: [
            {
                id: 'quote',
                label: 'Quote',
                fields: [
                    { name: 'text', type: 'textarea', label: 'Text' },
                    { name: 'author', type: 'text', label: 'Author' },
                ],
            },
            {
                id: 'body',
                label: 'Text',
                fields: [{ name: 'body', type: 'richtext', label: 'Body' }],
            },
        ],
    },
];

export const EXAMPLE_VALUES: Record<string, unknown> = {
    title: { fr: 'Été à Montréal', en: 'Summer in Montreal' },
    slug: 'ete-a-montreal',
    duration: 3930,
    season: 2,
    topics: ['culture', 'montréal'],
    metadata: { source: 'archive', episode: 12 },
    status: 'draft',
    platforms: ['web'],
    author: { id: '1', label: 'Ada Lovelace' },
    transcript: {
        name: 'transcript.pdf',
        url: 'https://files.example/transcript.pdf',
        mime: 'application/pdf',
        size: 52000,
    },
    blocks: [{ type: 'quote', text: 'Hello.', author: 'Ada' }],
};

const AUTHORS: RelationReference[] = [
    { id: '1', label: 'Ada Lovelace' },
    { id: '2', label: 'Grace Hopper' },
    { id: '3', label: 'Katherine Johnson' },
    { id: '4', label: 'Margaret Hamilton' },
];

/** A relation source over a few authors, with a short delay. */
export const exampleRelationSource: RelationSource = {
    async search(_resource, query, { signal }) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        signal.throwIfAborted();
        return AUTHORS.filter((author) => author.label.toLowerCase().includes(query.toLowerCase()));
    },
};

/**
 * A relation source that also resolves ids (`resolve()`) and creates authors from the picker
 * (`create()`), in memory.
 */
export function createEditableRelationSource(): RelationSource {
    const authors = [...AUTHORS];
    return {
        ...exampleRelationSource,
        async search(_resource, query, { signal }) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            signal.throwIfAborted();
            return authors.filter((author) =>
                author.label.toLowerCase().includes(query.toLowerCase()),
            );
        },
        async resolve(_resource, ids) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            return authors.filter((author) => ids.includes(author.id));
        },
        async create(_resource, text) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            const author = { id: String(authors.length + 1), label: text };
            authors.push(author);
            return author;
        },
    };
}
