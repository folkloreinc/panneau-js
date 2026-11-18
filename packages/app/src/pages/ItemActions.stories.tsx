/**
 * The actions of an item in the header of its edit page: those placed in `form` that the item
 * allows, run through the action runner of `@panneau/actions`. Those that destroy come last,
 * outlined in the danger color (decision 0088).
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import { selectItemActions } from '@panneau/core';
import type { Action, ActionResult, Item } from '@panneau/protocol';

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

// An active project: it can be disabled, not enabled.
const project: Item = {
    id: 'prj_1',
    version: null,
    name: 'Northwind',
    abilities: { jobs: true, disable: true, delete: true },
};

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
        // The actions of the item in the header, as `getItemActions()` gives them
        actions: selectItemActions(actions, project, 'form'),
        item: project,
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
        const jobs = canvas.getByRole('link', { name: 'Jobs' });
        await expect(jobs).toHaveAttribute('href', '/admin/pages/jobs?project=prj_1');
        // A link looks like the buttons beside it
        const disable = canvas.getByRole('button', { name: 'Disable' });
        await expect(jobs.className).toBe(disable.className);
        await expect(jobs.getBoundingClientRect().height).toBe(
            disable.getBoundingClientRect().height,
        );
        // The item doesn't allow it
        await expect(canvas.queryByRole('button', { name: 'Enable' })).not.toBeInTheDocument();
        // Last, outlined in its color, as high as the others, without a fill
        const remove = canvas.getByRole('button', { name: 'Delete' });
        await expect(disable.compareDocumentPosition(remove)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
        await expect(remove.getBoundingClientRect().height).toBe(
            disable.getBoundingClientRect().height,
        );
        await expect(getComputedStyle(remove).backgroundColor).toBe(
            getComputedStyle(disable).backgroundColor,
        );
        await expect(getComputedStyle(remove).borderColor).not.toBe(
            getComputedStyle(disable).borderColor,
        );
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

/** A declared action that destroys, before the links in its declaration: still last. */
export const DestructiveFirst: Story = {
    args: {
        actions: selectItemActions(
            [
                ...actions.filter(({ id }) => id === 'delete'),
                ...actions.filter(({ id }) => id !== 'delete'),
            ],
            project,
            'form',
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const controls = canvas.getAllByRole('button').concat(canvas.getAllByRole('link'));
        const remove = canvas.getByRole('button', { name: 'Delete' });
        for (const control of controls.filter((element) => element !== remove)) {
            await expect(control.compareDocumentPosition(remove)).toBe(
                Node.DOCUMENT_POSITION_FOLLOWING,
            );
        }
    },
};
