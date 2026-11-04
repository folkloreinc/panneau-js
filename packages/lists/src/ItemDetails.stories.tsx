import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

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
