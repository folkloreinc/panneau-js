/**
 * The actions of an item in the header of its edit page: those placed in `form` that the item
 * allows, run through the action runner of `@panneau/actions`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import type { Action, ActionResult } from '@panneau/protocol';

import { ItemActions } from './ItemActions';
import { PageHeader } from './PageHeader';

const actions: Action[] = [
    {
        id: 'jobs',
        label: 'Jobs',
        kind: 'link',
        url: '/admin/pages/jobs?project={id}',
        scope: ['item'],
    },
    { id: 'disable', label: 'Disable', kind: 'server', scope: ['item'] },
    { id: 'enable', label: 'Enable', kind: 'server', scope: ['item'] },
    {
        id: 'delete',
        label: 'Delete',
        kind: 'server',
        scope: ['item', 'selection'],
        destructive: true,
        confirm: { title: 'Delete the project?', message: 'Its keys stop working at once.' },
    },
];

const runAction = fn((_resource: string, action: string) =>
    Promise.resolve({
        result: {
            message: action === 'delete' ? 'Project deleted.' : 'Project disabled.',
        } as ActionResult,
    }),
);

const meta = {
    title: 'App/Item actions',
    component: ItemActions,
    args: {
        resource: 'projects',
        actions,
        // An active project: it can be disabled, not enabled.
        item: {
            id: 'prj_1',
            version: null,
            name: 'Northwind',
            abilities: { jobs: true, disable: true, delete: true },
        },
    },
    render: (args) => (
        <ActionRunnerProvider
            adapter={{ runAction, getActionRun: () => Promise.reject(new Error('No runs.')) }}
        >
            <PageHeader title="Northwind" actions={<ItemActions {...args} />} />
        </ActionRunnerProvider>
    ),
} satisfies Meta<typeof ItemActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Jobs' })).toHaveAttribute(
            'href',
            '/admin/pages/jobs?project=prj_1',
        );
        // The item doesn't allow it
        await expect(canvas.queryByRole('button', { name: 'Enable' })).not.toBeInTheDocument();
        runAction.mockClear();
        await userEvent.click(canvas.getByRole('button', { name: 'Disable' }));
        await expect(runAction.mock.calls[0]?.slice(0, 2)).toEqual(['projects', 'disable']);
    },
};

/** An action that asks first. */
export const Confirmation: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        runAction.mockClear();
        await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
        const dialog = within(await within(document.body).findByRole('alertdialog'));
        await expect(dialog.getByText('Its keys stop working at once.')).toBeInTheDocument();
        await userEvent.click(dialog.getByRole('button', { name: 'Delete' }));
        await expect(runAction.mock.calls[0]?.slice(0, 2)).toEqual(['projects', 'delete']);
    },
};
