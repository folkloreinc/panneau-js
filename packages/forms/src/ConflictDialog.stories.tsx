import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { Field, Item } from '@panneau/protocol';

import { ConflictDialog } from './ConflictDialog';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'summary', type: 'textarea', label: 'Summary' },
    { name: 'featured', type: 'boolean', label: 'Featured' },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In review' },
        ],
    },
];

/** The item as someone else saved it, which the backend sent with its `412`. */
const CURRENT: Item = {
    id: '1',
    version: '3',
    abilities: {},
    title: 'The river festival is back',
    summary: 'Three days of music on the banks.',
    featured: true,
    status: 'review',
};

/** The dialog of a version conflict (decision 0008): the values that differ, and two ways out. */
const meta = {
    title: 'Forms/ConflictDialog',
    component: ConflictDialog,
    args: {
        isOpen: true,
        fields: FIELDS,
        values: {
            title: 'The river festival returns',
            summary: 'Three days of music on the banks.',
            featured: false,
            status: 'draft',
        },
        current: CURRENT,
        onReload: fn(),
        onOverwrite: fn(),
    },
} satisfies Meta<typeof ConflictDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The current item differs: each value that changed, yours next to the current one. */
export const Changes: Story = {
    play: async ({ args, canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', {
            name: 'Someone else saved this item',
        });
        // The summary is the same in both: it isn't listed
        await expect(
            within(dialog)
                .getAllByRole('term')
                .map((term) => term.textContent),
        ).toEqual(['Title', 'Featured', 'Status']);
        await expect(dialog).toHaveTextContent('YoursThe river festival returns');
        await expect(dialog).toHaveTextContent('CurrentThe river festival is back');
        // Options show their labels
        await expect(dialog).toHaveTextContent('CurrentIn review');
        await userEvent.click(
            within(dialog).getByRole('button', { name: 'Load the current version' }),
        );
        await expect(args.onReload).toHaveBeenCalledTimes(1);
        await userEvent.click(within(dialog).getByRole('button', { name: 'Save mine anyway' }));
        await expect(args.onOverwrite).toHaveBeenCalledTimes(1);
    },
};

/** The backend didn't send the current item: the dialog can't say what changed. */
export const WithoutCurrent: Story = {
    args: { current: null },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', {
            name: 'Someone else saved this item',
        });
        await expect(dialog).toHaveTextContent(
            'The current version wasn’t sent: load it to see what changed.',
        );
        await expect(within(dialog).queryByRole('term')).toBeNull();
    },
};

/** Overwriting: the button shows its progress, and the other one waits. */
export const Pending: Story = {
    args: { isPending: true },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', {
            name: 'Someone else saved this item',
        });
        await expect(
            within(dialog).getByRole('button', { name: 'Load the current version' }),
        ).toBeDisabled();
    },
};
