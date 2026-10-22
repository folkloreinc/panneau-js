import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import { ItemDetails } from './ItemDetails';
import type { ListColumn } from './types';

const statusField: Field = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
    ],
};

const columns: ListColumn[] = [
    { id: 'title', label: 'Title' },
    { id: 'status', label: 'Status', field: statusField, display: 'select' },
    { id: 'published_on', label: 'Published on', display: 'date' },
    { id: 'featured', label: 'Featured', display: 'boolean' },
    { id: 'email', label: 'Contact', display: 'email' },
    { id: 'summary', label: 'Summary' },
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
        ]);
        await expect(canvas.getByRole('link', { name: 'news@example.com' })).toHaveAttribute(
            'href',
            'mailto:news@example.com',
        );
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
