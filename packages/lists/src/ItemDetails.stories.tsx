import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { FieldsProvider, type RelationSource } from '@panneau/fields';
import type { Field } from '@panneau/protocol';

import { ItemDetails } from './ItemDetails';
import type { ListColumn } from './types';

const statusField: Field = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published', tone: 'success' },
    ],
};

/** A secret: shown as dots. */
const keyField: Field = {
    name: 'api_key',
    type: 'text',
    label: 'API key',
    settings: { secret: true },
};

const columns: ListColumn[] = [
    { id: 'title', label: 'Title' },
    { id: 'status', label: 'Status', field: statusField, display: 'select' },
    { id: 'published_on', label: 'Published on', display: 'date' },
    { id: 'featured', label: 'Featured', display: 'boolean' },
    { id: 'email', label: 'Contact', display: 'email' },
    { id: 'summary', label: 'Summary' },
    { id: 'api_key', label: 'API key', field: keyField },
];

/** The values of one item, with the displays of the lists: the details of an item. */
const meta = {
    title: 'Lists/Item details',
    component: ItemDetails,
    parameters: { layout: 'padded' },
    args: {
        'aria-label': 'The river festival returns',
        columns,
        item: {
            id: '1',
            version: null,
            abilities: {},
            title: 'The river festival returns',
            status: 'published',
            published_on: '2026-10-28',
            featured: true,
            email: 'news@example.com',
            summary: null,
            api_key: 'nw_live_51Hx',
        },
    },
} satisfies Meta<typeof ItemDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Title',
            'Status',
            'Published on',
            'Featured',
            'Contact',
            'Summary',
            'API key',
        ]);
        // The tone of the option, and the secret as dots
        await expect(canvas.getByText('Published').closest('.panneau-badge')).toHaveClass(
            'panneau-tone-success',
        );
        await expect(canvas.queryByText('nw_live_51Hx')).not.toBeInTheDocument();
        await expect(canvas.getByRole('img', { name: 'Hidden value' })).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: 'news@example.com' })).toHaveAttribute(
            'href',
            'mailto:news@example.com',
        );
    },
};

/** The item loads: the labels, with a skeleton of each value, announced once. */
export const Loading: Story = {
    args: { item: undefined },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading the item…');
        const region = canvasElement.querySelector('[aria-busy="true"]');
        await expect(region?.querySelectorAll('dd .panneau-skeleton')).toHaveLength(7);
    },
};

/** Groups: the values of their fields under their label, indented. */
export const WithGroups: Story = {
    args: {
        'aria-label': 'Order 1042',
        columns: [
            { id: 'product', label: 'Product' },
            {
                id: 'contact',
                label: 'Contact',
                columns: [
                    { id: 'name', label: 'Name' },
                    { id: 'email', label: 'Email', display: 'email' },
                ],
            },
            {
                id: 'address',
                label: 'Address',
                columns: [
                    { id: 'city', label: 'City' },
                    { id: 'country', label: 'Country' },
                ],
            },
        ],
        item: {
            id: '1042',
            product: 'A case of six bottles',
            contact: { name: 'Ada Lovelace', email: 'ada@example.com' },
            address: { city: 'Montréal', country: 'Canada' },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Product',
            'Contact',
            'Name',
            'Email',
            'Address',
            'City',
            'Country',
        ]);
        await expect(canvas.getByRole('link', { name: 'ada@example.com' })).toHaveAttribute(
            'href',
            'mailto:ada@example.com',
        );
    },
};

/**
 * Places: a country with its flag, and regions with theirs when they have one, in the country of
 * the item or of their field.
 */
export const WithPlaces: Story = {
    args: {
        'aria-label': 'Offices',
        columns: [
            { id: 'country', label: 'Country', display: 'country' },
            {
                id: 'province',
                label: 'Province',
                display: 'region',
                field: { name: 'province', type: 'region', label: 'Province', from: 'country' },
            },
            {
                id: 'state',
                label: 'State',
                display: 'region',
                field: {
                    name: 'state',
                    type: 'region',
                    label: 'State',
                    settings: { country: 'US' },
                },
            },
            {
                id: 'mexican_state',
                label: 'Mexican state',
                display: 'region',
                field: {
                    name: 'mexican_state',
                    type: 'region',
                    label: 'Mexican state',
                    settings: { country: 'MX' },
                },
            },
        ],
        item: {
            id: '1',
            country: 'CA',
            province: 'QC',
            state: 'NY',
            mexican_state: 'JAL',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Quebec')).toBeInTheDocument();
        await expect(canvas.getByText('Jalisco')).toBeInTheDocument();
        // A flag for Quebec and New York, none for Jalisco: decorative, the names describe them
        await waitFor(() => expect(canvasElement.querySelectorAll('img')).toHaveLength(2));
        for (const image of canvasElement.querySelectorAll('img')) {
            await expect(image).toHaveAttribute('alt', '');
        }
    },
};

/** A square image, inline, so that the story needs no network. */
function swatch(color: string): string {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${color}"/></svg>`,
    )}`;
}

/** Where related items open: the relation source of the fields, as the app gives it. */
const relationSource: RelationSource = {
    search: () => Promise.resolve([]),
    getItemHref: (resource, id) => `#/resources/${resource}/${id}`,
};

const longSummary =
    'The festival returns to the river for its tenth summer, with three stages on the water.\n' +
    'Boats leave the old port every half hour from noon, and the last one comes back at midnight.\n' +
    'Tickets are on sale at the door and on the site, with a discount for families.';

/**
 * Values in full, unlike in a cell: related items linked to their items, every media, text and
 * JSON in full, and each locale of a localized value, the interface's first.
 */
export const InFull: Story = {
    decorators: [
        (Story) => (
            <FieldsProvider locales={['en', 'fr']} relationSource={relationSource}>
                <Story />
            </FieldsProvider>
        ),
    ],
    args: {
        'aria-label': 'The river festival returns',
        columns: [
            {
                id: 'title',
                label: 'Title',
                field: { name: 'title', type: 'text', label: 'Title', localized: true },
            },
            { id: 'summary', label: 'Summary', display: 'textarea' },
            {
                id: 'authors',
                label: 'Authors',
                display: 'relation',
                field: { name: 'authors', type: 'relation', label: 'Authors', resource: 'people' },
            },
            { id: 'gallery', label: 'Gallery', display: 'media' },
            { id: 'settings', label: 'Settings', display: 'json' },
        ],
        item: {
            id: '1',
            title: { en: 'The river festival returns', fr: 'Le festival de la rivière revient' },
            summary: longSummary,
            authors: [
                { id: '7', label: 'Ada Lovelace', description: 'Editor' },
                { id: '8', label: 'Alan Turing' },
            ],
            gallery: [
                {
                    id: 'a',
                    label: 'The stage at night',
                    media: { thumbnailUrl: swatch('#2b6cb0') },
                },
                { id: 'b', label: 'The old port', media: { thumbnailUrl: swatch('#2f855a') } },
                { id: 'c', label: 'Fireworks', media: { thumbnailUrl: swatch('#c05621') } },
            ],
            settings: { stages: 3, boats: { every: '30 minutes', from: '12:00', until: '24:00' } },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // Each locale, the interface's first
        await expect(canvas.getByText('Le festival de la rivière revient')).toBeInTheDocument();
        await expect(canvas.getByText('English')).toBeInTheDocument();
        await expect(canvas.getByText('French')).toBeInTheDocument();
        // Related items link to their items
        await expect(canvas.getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
            'href',
            '#/resources/people/7',
        );
        await expect(canvas.getByRole('link', { name: 'Alan Turing' })).toHaveAttribute(
            'href',
            '#/resources/people/8',
        );
        // Every media
        await expect(canvas.getByText('Fireworks')).toBeInTheDocument();
        await expect(canvasElement.querySelectorAll('dd img')).toHaveLength(3);
        // Text in full, not clamped at two lines
        const summary = canvas.getByText(/tenth summer/);
        await expect(summary.closest('[data-clamp]')).toBeNull();
        await expect(summary.scrollHeight).toBeLessThanOrEqual(summary.clientHeight + 1);
        await expect(canvas.getByText(/"every": "30 minutes"/)).toBeInTheDocument();
    },
};

/** In a narrow column, such as a panel: each label above its value. */
export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '20rem' }}>
                <Story />
            </div>
        ),
    ],
};
