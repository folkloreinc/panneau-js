import type { ActionInput, DefinitionInput, ResourceInput } from '@panneau/protocol';
import { createExampleDefinition } from '@panneau/protocol/mock';

type FieldInput = ResourceInput['fields'][number];

type Values = Record<string, unknown>;

const STATUS: FieldInput = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'review', label: 'In review' },
        { value: 'published', label: 'Published' },
    ],
    rules: [{ rule: 'required' }],
};

const DELETE: ActionInput = {
    id: 'delete',
    label: 'Delete',
    icon: 'trash-2',
    scope: ['item', 'selection'],
    placement: ['menu', 'toolbar'],
    destructive: true,
    confirm: true,
};

/**
 * The admin of a small publication: the pages of the protocol's example definition, articles,
 * categories, authors and users, in a menu with groups and icons.
 */
export function createPlaygroundDefinition(): DefinitionInput {
    const example = createExampleDefinition();
    const pages = example.resources.find((resource) => resource.id === 'pages');
    if (pages === undefined) {
        throw new Error('The example definition has no pages.');
    }
    return {
        ...example,
        name: 'Northwind Journal',
        locale: 'en',
        locales: ['en', 'fr'],
        resources: [
            {
                ...pages,
                icon: 'file-text',
                description: 'The pages of the site, with their blocks.',
                features: { preview: { mode: 'component', component: 'page' } },
                actions: [...(pages.actions ?? []).filter(({ id }) => id !== 'edit'), DELETE],
            },
            {
                id: 'articles',
                label: { singular: 'article', plural: 'articles' },
                description: 'News and stories, by category.',
                icon: 'newspaper',
                features: { preview: { mode: 'iframe' } },
                itemTitle: 'title',
                itemSubtitle: 'category',
                fields: [
                    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
                    { name: 'summary', type: 'textarea', label: 'Summary' },
                    STATUS,
                    {
                        name: 'category',
                        type: 'relation',
                        label: 'Category',
                        resource: 'categories',
                    },
                    { name: 'author', type: 'relation', label: 'Author', resource: 'authors' },
                    { name: 'published_at', type: 'date', label: 'Publication date' },
                    { name: 'featured', type: 'boolean', label: 'Featured on the home page' },
                    {
                        name: 'tags',
                        type: 'tags',
                        label: 'Tags',
                        options: [
                            { value: 'festival', label: 'Festival' },
                            { value: 'family', label: 'Family' },
                            { value: 'free', label: 'Free' },
                        ],
                    },
                    {
                        name: 'reading_time',
                        type: 'duration',
                        label: 'Reading time',
                        settings: { precision: 'minutes' },
                    },
                    {
                        name: 'rating',
                        type: 'range',
                        label: 'Editor rating',
                        rules: [
                            { rule: 'min', value: 0 },
                            { rule: 'max', value: 5 },
                        ],
                        settings: { step: 0.5, suffix: '/ 5' },
                    },
                    { name: 'contact', type: 'tel', label: 'Press contact' },
                    { name: 'metadata', type: 'json', label: 'Metadata', settings: { rows: 4 } },
                ],
                form: {
                    layout: [
                        { type: 'field', name: 'title' },
                        { type: 'field', name: 'summary' },
                        {
                            type: 'row',
                            children: [
                                { type: 'field', name: 'category', width: 6 },
                                { type: 'field', name: 'author', width: 6 },
                            ],
                        },
                        { type: 'field', name: 'tags' },
                        { type: 'field', name: 'metadata' },
                        {
                            type: 'sidebar',
                            children: [
                                { type: 'field', name: 'status' },
                                { type: 'field', name: 'published_at' },
                                { type: 'field', name: 'featured' },
                                { type: 'field', name: 'reading_time' },
                                { type: 'field', name: 'rating' },
                                { type: 'field', name: 'contact' },
                            ],
                        },
                    ],
                },
                list: {
                    columns: [
                        { field: 'title', sortable: true },
                        { field: 'status' },
                        { field: 'category' },
                        { field: 'published_at', sortable: true },
                        { field: 'tags' },
                        { field: 'reading_time' },
                    ],
                    filters: [
                        { id: 'status', type: 'select' },
                        { id: 'featured', type: 'toggle', label: 'Featured' },
                    ],
                    sorts: ['title', 'published_at'],
                    defaultSort: '-published_at',
                    perPage: 20,
                    search: true,
                },
                actions: [
                    {
                        id: 'view',
                        label: 'View on the site',
                        icon: 'globe',
                        kind: 'link',
                        url: 'https://example.com/articles/{id}',
                        scope: ['item'],
                        placement: ['menu'],
                    },
                    DELETE,
                ],
                abilities: { viewAny: true, create: true },
            },
            {
                id: 'categories',
                label: { singular: 'category', plural: 'categories' },
                icon: 'tags',
                itemTitle: 'name',
                fields: [
                    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
                    { name: 'color', type: 'color', label: 'Color' },
                ],
                list: { columns: [{ field: 'name', sortable: true }, { field: 'color' }] },
                actions: [DELETE],
                abilities: { viewAny: true, create: true },
            },
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                icon: 'pen-line',
                itemTitle: 'name',
                itemSubtitle: 'email',
                fields: [
                    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
                    { name: 'email', type: 'email', label: 'Email' },
                    { name: 'bio', type: 'textarea', label: 'Biography' },
                ],
                list: {
                    columns: [{ field: 'name', sortable: true }, { field: 'email' }],
                    search: true,
                },
                actions: [DELETE],
                abilities: { viewAny: true, create: true },
            },
            {
                id: 'users',
                label: { singular: 'user', plural: 'users' },
                description: 'Who can sign in to this admin panel.',
                icon: 'users',
                itemTitle: 'name',
                itemSubtitle: 'email',
                fields: [
                    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
                    {
                        name: 'email',
                        type: 'email',
                        label: 'Email',
                        rules: [{ rule: 'required' }, { rule: 'email' }],
                    },
                    {
                        name: 'role',
                        type: 'select',
                        label: 'Role',
                        options: [
                            { value: 'admin', label: 'Administrator' },
                            { value: 'editor', label: 'Editor' },
                            { value: 'viewer', label: 'Viewer' },
                        ],
                    },
                ],
                list: {
                    columns: [
                        { field: 'name', sortable: true },
                        { field: 'email' },
                        { field: 'role' },
                    ],
                    filters: [{ id: 'role', type: 'select' }],
                },
                abilities: { viewAny: true, create: true },
            },
        ],
        menus: {
            main: [
                {
                    type: 'group',
                    label: 'Content',
                    children: [
                        { type: 'resource', resource: 'pages' },
                        { type: 'resource', resource: 'articles' },
                        { type: 'resource', resource: 'categories' },
                    ],
                },
                {
                    type: 'group',
                    label: 'People',
                    children: [
                        { type: 'resource', resource: 'authors' },
                        { type: 'resource', resource: 'users' },
                    ],
                },
                { type: 'separator' },
                {
                    type: 'link',
                    label: 'View the site',
                    url: 'https://example.com',
                    external: true,
                    icon: 'globe',
                },
            ],
        },
        auth: { mode: 'external', loginUrl: null },
        user: { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
    };
}

const TITLES = [
    'The river festival returns',
    'A new library for the east side',
    'Ten walks for the fall',
    'Inside the night market',
    'How the bridge was built',
    'The bakery that never closes',
    'Bike lanes, one year later',
    'Meet the new city council',
    'A guide to the harbour islands',
    'Winter farmers’ markets',
    'The last record store downtown',
    'Rooftop gardens take root',
    'A century of the old theatre',
    'Where to swim this summer',
    'The quiet rise of tiny museums',
    'Ferry schedules are changing',
    'A day with the snow plow crew',
    'The best soup in town, ranked',
    'Murals of the north end',
    'Behind the scenes at the zoo',
    'Our readers’ favourite parks',
    'The return of the night bus',
    'A short history of the harbour',
    'What’s new at the botanical garden',
];

const STATUSES = ['published', 'draft', 'review'];

/** Items of every resource, for the mock backend. */
export function createPlaygroundItems(): Record<string, Values[]> {
    const categories = [
        { id: '1', name: 'City', color: '#2563eb' },
        { id: '2', name: 'Culture', color: '#db2777' },
        { id: '3', name: 'Outdoors', color: '#16a34a' },
        { id: '4', name: 'Food', color: '#ea580c' },
    ];
    const authors = [
        { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
        { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
        { id: '3', name: 'Katherine Johnson', email: 'katherine@example.com' },
    ];
    // The item at an index, cycling through the list.
    const pick = <T>(list: readonly T[], index: number) => list[index % list.length] as T;
    const reference = (item: { id: string; name: string }) => ({ id: item.id, label: item.name });
    return {
        pages: ['About us', 'Contact', 'Advertise', 'Privacy', 'Terms'].map((title, index) => ({
            id: String(index + 1),
            title: { en: title, fr: title },
            status: index < 3 ? 'published' : 'draft',
            ...(index < 3 ? { published_at: '2026-09-01T13:30:00Z' } : {}),
            author: reference(pick(authors, 0)),
            blocks: [
                {
                    type: 'text',
                    body: `<p>${title}: everything you need to know about the Northwind Journal, its team and the city it covers.</p>`,
                },
                { type: 'image', image: null },
            ],
            updated: `2026-10-${String(10 + index).padStart(2, '0')}`,
        })),
        articles: TITLES.map((title, index) => ({
            id: String(index + 1),
            title,
            summary:
                index % 2 === 0
                    ? 'The city turns out for a weekend of music, food and boats on the water.'
                    : '',
            status: STATUSES[index % STATUSES.length],
            category: reference(pick(categories, index)),
            author: reference(pick(authors, index)),
            published_at: `2026-${String(10 - Math.floor(index / 9)).padStart(2, '0')}-${String(28 - (index % 9) * 3).padStart(2, '0')}`,
            featured: index % 5 === 0,
            tags: index % 3 === 0 ? ['festival', 'family'] : index % 3 === 1 ? ['free'] : [],
            reading_time: (3 + (index % 7)) * 60,
            rating: (index % 11) / 2,
            metadata: index === 0 ? { source: 'archive', revisions: 3 } : null,
        })),
        categories,
        authors,
        users: [
            { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
            { id: '2', name: 'Grace Hopper', email: 'grace@example.com', role: 'editor' },
            { id: '3', name: 'Alan Turing', email: 'alan@example.com', role: 'viewer' },
        ],
    };
}
