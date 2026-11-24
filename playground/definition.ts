import type { ActionInput, DefinitionInput, ResourceInput } from '@panneau/protocol';
import { createExampleDefinition } from '@panneau/protocol/mock';

import { createPlaygroundMedia, mediaReference } from './media';

type FieldInput = ResourceInput['fields'][number];

type Values = Record<string, unknown>;

const STATUS: FieldInput = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft', tone: 'neutral' },
        { value: 'review', label: 'In review', tone: 'warning' },
        { value: 'published', label: 'Published', tone: 'success' },
    ],
    rules: [{ rule: 'required' }],
};

const DELETE: ActionInput = {
    id: 'delete',
    label: 'Delete',
    icon: 'trash-2',
    scope: ['item', 'selection'],
    // As the built-in `delete`: rows, the header of the form and of the panel, and selections
    placement: ['menu', 'form', 'toolbar'],
    destructive: true,
    confirm: true,
};

/** The publications of the context of the playground, each with its desks. */
export const PUBLICATIONS = [
    { id: 'journal', label: 'Northwind Journal', desks: ['City', 'Culture', 'Sports', 'Food'] },
    { id: 'kids', label: 'Northwind Kids', desks: ['Stories', 'Games', 'Science'] },
];

/**
 * The labels of the protocol's example definition, which is in French, as this English admin shows
 * them. The example stays as it is: it is the definition of the protocol's tests and stories.
 */
const ENGLISH: Readonly<Record<string, string>> = {
    Titre: 'Title',
    Brouillon: 'Draft',
    Publiée: 'Published',
    Texte: 'Text',
    Contenu: 'Content',
    'Pièce jointe': 'Attachment',
    Publier: 'Publish',
    'Publier {count} pages ?': 'Publish {count} pages?',
    Vidéos: 'Videos',
};

/** Labels for the fields of the example that have none, by name. */
const FIELD_LABELS: Readonly<Record<string, string>> = {
    status: 'Status',
    published_at: 'Publication date',
    author: 'Author',
    blocks: 'Blocks',
    body: 'Text',
    image: 'Image',
    slug: 'Address',
    notify: 'Notify subscribers',
    file: 'File',
    name: 'Name',
    alt: 'Alternative text',
};

/**
 * A resource of the example definition in English: its labels translated, a label for each of its
 * fields, and its sidebar panel of files apart from the field in it.
 */
function inEnglish<T>(node: T): T {
    if (Array.isArray(node)) {
        return node.map((child: unknown) => inEnglish(child)) as T;
    }
    if (node === null || typeof node !== 'object') {
        return node;
    }
    const entries = Object.entries(node as Record<string, unknown>).map(([key, value]) => [
        key,
        (key === 'label' || key === 'message') && typeof value === 'string'
            ? (ENGLISH[value] ?? value)
            : inEnglish(value),
    ]);
    const result = Object.fromEntries(entries) as Record<string, unknown>;
    const { type, name, label } = result;
    // A field without a label (not a field of a layout, which has its field's)
    if (
        typeof name === 'string' &&
        typeof type === 'string' &&
        type !== 'field' &&
        label === undefined &&
        FIELD_LABELS[name] !== undefined
    ) {
        result.label = FIELD_LABELS[name];
    }
    // The panel of the attachment, which the example titles as its field
    if (type === 'sidebar' && label === 'Attachment') {
        result.label = 'Files';
    }
    return result as T;
}

/**
 * The admin of a small publication: the pages and the media library of the protocol's example
 * definition, in English, articles, categories, authors and users, in a menu with groups and
 * icons.
 */
export function createPlaygroundDefinition(): DefinitionInput {
    const example = createExampleDefinition();
    const examplePages = example.resources.find((resource) => resource.id === 'pages');
    const media = example.resources.find((resource) => resource.id === 'media');
    if (examplePages === undefined || media === undefined) {
        throw new Error('The example definition has no pages or no media library.');
    }
    const pages = inEnglish(examplePages);
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
                itemStatus: 'status',
                fields: [
                    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
                    { name: 'summary', type: 'textarea', label: 'Summary' },
                    {
                        name: 'body',
                        type: 'richtext',
                        label: 'Body',
                        settings: {
                            toolbar: [
                                'heading',
                                'style',
                                '|',
                                'bold',
                                'italic',
                                'link',
                                '|',
                                'bulletList',
                                'orderedList',
                                'blockquote',
                                '|',
                                'undo',
                                'redo',
                            ],
                            headings: [2, 3],
                            styles: [{ label: 'Big paragraph', class: 'big' }],
                            links: { newTab: 'external' },
                        },
                    },
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
                        settings: { unit: 'minutes' },
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
                    {
                        name: 'contact',
                        type: 'tel',
                        label: 'Press contact',
                        settings: { country: 'CA', extension: true },
                    },
                    {
                        name: 'event',
                        type: 'daterange',
                        label: 'Event',
                        help: 'When the story happens, if it is an event.',
                        settings: { time: true, allDay: true, timeZone: 'America/Toronto' },
                    },
                    {
                        name: 'price',
                        type: 'money',
                        label: 'Ticket price',
                        rules: [{ rule: 'min', value: 0 }],
                        settings: { currencies: ['CAD', 'USD'] },
                    },
                    {
                        name: 'video',
                        type: 'embed',
                        label: 'Video',
                        help: 'A video of the festival.',
                        rules: [{ rule: 'providers', value: ['YouTube', 'Vimeo'] }],
                    },
                    {
                        name: 'countries',
                        type: 'country',
                        label: 'Countries of the artists',
                        multiple: true,
                        settings: { preferred: ['CA', 'US', 'FR'] },
                    },
                    {
                        name: 'place',
                        type: 'location',
                        label: 'Place',
                        settings: { center: { lat: 45.5017, lng: -73.5673 }, zoom: 14 },
                    },
                    {
                        name: 'venue',
                        type: 'address',
                        label: 'Venue',
                        settings: { country: 'CA', preferred: ['CA', 'US'] },
                    },
                    {
                        name: 'cta',
                        type: 'link',
                        label: 'Button',
                        resource: ['articles', 'categories'],
                        settings: { newTab: 'external' },
                    },
                    { name: 'metadata', type: 'json', label: 'Metadata', settings: { rows: 4 } },
                ],
                form: {
                    layout: [
                        { type: 'field', name: 'title' },
                        { type: 'field', name: 'summary' },
                        { type: 'field', name: 'body' },
                        {
                            type: 'row',
                            children: [
                                { type: 'field', name: 'category', width: 6 },
                                { type: 'field', name: 'author', width: 6 },
                            ],
                        },
                        { type: 'field', name: 'tags' },
                        { type: 'field', name: 'event' },
                        { type: 'field', name: 'video' },
                        { type: 'field', name: 'place' },
                        { type: 'field', name: 'venue' },
                        { type: 'field', name: 'cta' },
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
                                { type: 'field', name: 'price' },
                            ],
                        },
                    ],
                },
                list: {
                    columns: [
                        { field: 'title', sortable: true, hideable: false },
                        { field: 'status' },
                        { field: 'category' },
                        { field: 'published_at', sortable: true },
                        { field: 'tags', hidden: true },
                        { field: 'reading_time', hidden: true },
                    ],
                    filters: [
                        { id: 'status', type: 'select' },
                        { id: 'featured', type: 'toggle', label: 'Featured' },
                        { id: 'published_at', type: 'date-range', label: 'Published' },
                    ],
                    sorts: ['title', 'published_at'],
                    defaultSort: '-published_at',
                    perPage: 20,
                    search: true,
                    layouts: ['table', 'cards', 'calendar'],
                    calendar: { field: 'published_at' },
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
                    // Queued: the notification area of the shell follows it (see `main.tsx`)
                    {
                        id: 'export',
                        label: 'Export',
                        icon: 'download',
                        scope: ['resource', 'selection'],
                        placement: ['toolbar'],
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
                    {
                        name: 'background',
                        type: 'color',
                        label: 'Background',
                        settings: {
                            palette: [
                                { value: 'white', label: 'White', color: '#ffffff' },
                                { value: 'sand', label: 'Sand', color: '#e7d8b8' },
                                { value: 'night', label: 'Night', color: '#1e1b4b' },
                            ],
                        },
                    },
                ],
                list: {
                    columns: [
                        { field: 'name', sortable: true },
                        { field: 'color' },
                        { field: 'background' },
                    ],
                },
                actions: [DELETE],
                abilities: { viewAny: true, create: true },
            },
            // The media library of the Image blocks of pages and of the photos of authors, with
            // the media picker (decision 0027)
            {
                ...inEnglish(media),
                label: { singular: 'media item', plural: 'media' },
                description: 'Images, videos and documents, used in pages and by authors.',
                icon: 'image',
            },
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                icon: 'pen-line',
                // Read more than edited: their titles open the item panel over the list, with
                // "Edit" in it (decisions 0082 and 0099).
                open: 'panel',
                itemTitle: 'name',
                itemSubtitle: 'email',
                itemImage: 'photo',
                fields: [
                    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
                    { name: 'email', type: 'email', label: 'Email' },
                    { name: 'photo', type: 'image', label: 'Photo', ratios: ['1:1'] },
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
                        { type: 'resource', resource: 'media' },
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
        // The current context (decision 0045): a publication, then one of its desks, searched
        // through `GET /context/desk/options`. Articles are kept to the publication.
        context: {
            params: [
                {
                    name: 'publication',
                    label: 'Publication',
                    allLabel: 'All publications',
                    options: PUBLICATIONS.map(({ id, label }) => ({ value: id, label })),
                },
                { name: 'desk', label: 'Desk', allLabel: 'All desks' },
            ],
        },
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
    // The item at an index, cycling through the list.
    const pick = <T>(list: readonly T[], index: number) => list[index % list.length] as T;
    const categories = [
        { id: '1', name: 'City', color: '#2563eb', background: 'night' },
        { id: '2', name: 'Culture', color: '#db2777', background: 'sand' },
        { id: '3', name: 'Outdoors', color: '#16a34a' },
        { id: '4', name: 'Food', color: '#ea580c' },
    ];
    const media = createPlaygroundMedia();
    const image = (index: number) => mediaReference(pick(media, index));
    const authors = [
        { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
        { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
        { id: '3', name: 'Katherine Johnson', email: 'katherine@example.com' },
    ];
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
                // The first pages show an image of the library, the others an empty block
                { type: 'image', image: index < 3 ? image(index) : null },
            ],
            updated: `2026-10-${String(10 + index).padStart(2, '0')}`,
        })),
        articles: TITLES.map((title, index) => ({
            id: String(index + 1),
            title,
            publication: index % 4 === 3 ? 'kids' : 'journal',
            summary:
                index % 2 === 0
                    ? 'The city turns out for a weekend of music, food and boats on the water.'
                    : '',
            body:
                index % 2 === 0
                    ? '<h2>The program</h2><p class="big">Three days on the water, from noon to midnight.</p><p>Tickets are on <a href="https://example.com/tickets" target="_blank" rel="noopener noreferrer">the festival site</a>. <i>Free for children.</i></p><ul><li>Concerts</li><li>Food trucks</li></ul><figure class="media"><oembed url="https://www.youtube.com/watch?v=abc123"></oembed></figure>'
                    : null,
            status: STATUSES[index % STATUSES.length],
            category: reference(pick(categories, index)),
            author: reference(pick(authors, index)),
            published_at: `2026-${String(10 - Math.floor(index / 9)).padStart(2, '0')}-${String(28 - (index % 9) * 3).padStart(2, '0')}`,
            featured: index % 5 === 0,
            tags: index % 3 === 0 ? ['festival', 'family'] : index % 3 === 1 ? ['free'] : [],
            reading_time: 3 + (index % 7),
            rating: (index % 11) / 2,
            metadata: index === 0 ? { source: 'archive', revisions: 3 } : null,
            place:
                index === 0
                    ? { lat: 45.508, lng: -73.554, address: 'Vieux-Port de Montréal, Montréal' }
                    : null,
        })),
        categories,
        media,
        authors: authors.map((author, index) => ({
            ...author,
            photo: index < 2 ? image(index + 1) : null,
        })),
        users: [
            { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
            { id: '2', name: 'Grace Hopper', email: 'grace@example.com', role: 'editor' },
            { id: '3', name: 'Alan Turing', email: 'alan@example.com', role: 'viewer' },
        ],
    };
}
