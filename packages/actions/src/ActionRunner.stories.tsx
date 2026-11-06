import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider } from '@panneau/core';
import { List } from '@panneau/lists';
import type { Action, ActionResult, ActionRun, Definition } from '@panneau/protocol';
import { createExampleDefinition } from '@panneau/protocol/mock';

import { ActionRunnerProvider } from './ActionRunnerProvider';
import { ActionRuns } from './ActionRuns';
import type { ActionAdapter } from './types';
import { useActionRunner } from './useActionRunner';

const items = [
    { id: '1', title: 'Home', status: 'published' },
    { id: '2', title: 'Contact', status: 'draft' },
    { id: '3', title: 'About us', status: 'draft', abilities: { publish: false } },
];

const actions: Action[] = [
    {
        id: 'publish',
        label: 'Publish',
        kind: 'server',
        scope: ['item', 'selection'],
        placement: ['toolbar'],
        fields: [
            {
                name: 'note',
                type: 'textarea',
                label: 'Note to the authors',
                rules: [{ rule: 'required' }],
            },
            { name: 'notify', type: 'boolean', label: 'Notify the subscribers' },
        ],
    },
    { id: 'export', label: 'Export', kind: 'server', scope: ['resource'] },
    // Undoable: runs at once, and its toast offers "Undo" (decision 0063)
    {
        id: 'archive',
        label: 'Archive',
        kind: 'server',
        scope: ['item'],
        placement: ['row'],
        undoable: true,
    },
    { id: 'unarchive', label: 'Unarchive', kind: 'server', scope: ['item'], placement: [] },
];

/** An adapter in memory: `publish` answers at once, `export` is queued and runs for a while. */
function createStoryAdapter(): ActionAdapter {
    let checks = 0;
    const run: ActionRun = {
        id: 'run_1',
        action: 'export',
        resource: 'pages',
        status: 'queued',
        progress: 0,
        total: 3,
    };
    return {
        runAction: (_resource, action, request) => {
            if (action === 'export') {
                checks = 0;
                return Promise.resolve({ run });
            }
            const ids = (request.selection as { ids?: string[] } | undefined)?.ids ?? [];
            if (action === 'archive') {
                return Promise.resolve({
                    result: {
                        message: `“${items.find((item) => item.id === ids[0])?.title ?? ''}” archived.`,
                        undo: { action: 'unarchive', items: ids },
                    },
                });
            }
            if (action === 'unarchive') {
                return Promise.resolve({ result: { refresh: 'items' } });
            }
            const result: ActionResult = {
                message: `${ids.length - 1} page published.`,
                summary: { succeeded: ids.length - 1, failed: 0, skipped: 1 },
                results: [{ id: '3', status: 'skipped', reason: 'forbidden' }],
            };
            return Promise.resolve({ result });
        },
        getActionRun: () => {
            checks += 1;
            return Promise.resolve(
                checks < 3
                    ? { ...run, status: 'running', progress: checks }
                    : {
                          ...run,
                          status: 'succeeded',
                          progress: 3,
                          result: {
                              message: '3 pages exported.',
                              download: { url: '#pages.csv', filename: 'pages.csv' },
                          },
                      },
            );
        },
        cancelActionRun: () => Promise.resolve(),
    };
}

function Pages() {
    const runAction = useActionRunner('pages');
    return (
        <List
            aria-label="Pages"
            columns={[
                { id: 'title', label: 'Title' },
                { id: 'status', label: 'Status' },
            ]}
            items={items}
            actions={actions}
            onAction={runAction}
            router={null}
        />
    );
}

const meta = {
    title: 'Actions/ActionRunner',
    component: ActionRunnerProvider,
    parameters: { layout: 'padded' },
    args: { adapter: createStoryAdapter(), onResult: fn(), onDownload: fn(), pollInterval: 300 },
    render: (args) => (
        <ActionRunnerProvider {...args}>
            <Pages />
            <ActionRuns />
        </ActionRunnerProvider>
    ),
} satisfies Meta<typeof ActionRunnerProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A selection action with parameters: they are asked in a dialog, then the result is shown. */
export const Parameters: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Contact' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select About us' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Publish' }));
        // About us doesn't allow it: the list says so first.
        const confirm = await body.findByRole('alertdialog');
        await expect(confirm).toHaveTextContent('1 selected item doesn’t allow it');
        await userEvent.click(within(confirm).getByRole('button', { name: 'Publish' }));
        const dialog = await body.findByRole('dialog', { name: 'Publish' });
        await userEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));
        // Retried: the dialog may still be entering (its overlay fades in from no opacity).
        await waitFor(() =>
            expect(within(dialog).getByText('This field is required.')).toBeVisible(),
        );
        await userEvent.type(
            within(dialog).getByRole('textbox', { name: 'Note to the authors' }),
            'Ready to go.',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));
        // Toasts fade in from below.
        const published = await body.findByText('1 page published.');
        await waitFor(() => expect(published).toBeVisible());
        await expect(body.getByText('1 item done, 1 skipped')).toBeVisible();
        await waitFor(() => expect(args.onResult).toHaveBeenCalled());
        await userEvent.click(body.getByRole('button', { name: 'Details' }));
        const details = await body.findByRole('dialog', { name: '“Publish”: items not done' });
        await expect(details).toHaveTextContent('Item 3SkippedNot allowed');
    },
};

/** A queued action: its progress, then its result and its download. */
export const QueuedRun: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
        // No toast when it starts: the list of runs follows it.
        const runs = await canvas.findByRole('list', { name: 'Actions in progress' });
        await expect(body.queryByText(/running in the background/)).toBeNull();
        await expect(
            await within(runs).findByRole('progressbar', { name: 'Export' }),
        ).toBeInTheDocument();
        const exported = await body.findByText('3 pages exported.', {}, { timeout: 5000 });
        await waitFor(() => expect(exported).toBeVisible());
        await expect(args.onDownload).toHaveBeenCalledWith({
            url: '#pages.csv',
            filename: 'pages.csv',
        });
        await expect(within(runs).getByText('Done')).toBeVisible();
    },
};

/**
 * An undoable action: it runs without a confirmation, and its toast offers "Undo" for about 10
 * seconds, with the keyboard too. After it, a short toast says it was undone.
 */
export const Undo: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getAllByRole('button', { name: /Archive/ })[1] as HTMLElement);
        await expect(body.queryByRole('alertdialog', { name: /Archive\?/ })).toBeNull();
        const toast = await body.findByRole('alertdialog', { name: /“Contact” archived\./ });
        const undo = within(toast).getByRole('button', { name: 'Undo' });
        undo.focus();
        await userEvent.keyboard('{Enter}');
        await expect(await body.findByText('“Archive” is undone.')).toBeInTheDocument();
        await waitFor(() =>
            expect(args.onResult).toHaveBeenLastCalledWith(
                { refresh: 'items' },
                expect.objectContaining({ resource: 'pages' }),
            ),
        );
    },
};

/**
 * "Show" opens the list of the items a selection changed (decision 0069), when the toast has
 * nothing more to say: no "Undo", "Details" or "Download".
 */
export const ShowChanged: Story = {
    args: {
        adapter: {
            ...createStoryAdapter(),
            runAction: (_resource, _action, request) => {
                const ids = (request.selection as { ids?: string[] } | undefined)?.ids ?? [];
                return Promise.resolve({ result: { message: `${ids.length} pages published.` } });
            },
        },
        onShowItems: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Home' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Contact' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Publish' }));
        const dialog = await body.findByRole('dialog', { name: 'Publish' });
        await userEvent.type(
            within(dialog).getByRole('textbox', { name: 'Note to the authors' }),
            'Ready to go.',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));
        const toast = await body.findByRole('alertdialog', { name: /2 pages published\./ });
        await userEvent.click(within(toast).getByRole('button', { name: 'Show' }));
        await expect(args.onShowItems).toHaveBeenCalledWith('pages', ['1', '2']);
    },
};

const remove: Action = {
    id: 'delete',
    kind: 'server',
    scope: ['item', 'selection'],
    placement: ['row', 'toolbar'],
    undoable: true,
};

/** An adapter in memory whose `delete` skips “Contact” as `in_use`: something else uses it. */
function createInUseAdapter(): ActionAdapter {
    return {
        runAction: (_resource, action, request) => {
            if (action === 'restore') {
                return Promise.resolve({ result: { refresh: 'list' } });
            }
            const ids = (request.selection as { ids?: string[] } | undefined)?.ids ?? [];
            const inUse = ids.filter((id) => id === '2');
            const deleted = ids.filter((id) => id !== '2');
            const result: ActionResult = {
                summary: { succeeded: deleted.length, failed: 0, skipped: inUse.length },
                results: inUse.map((id) => ({ id, status: 'skipped', reason: 'in_use' })),
                refresh: 'list',
                ...(deleted.length > 0 ? { undo: { action: 'restore', items: deleted } } : {}),
            };
            return Promise.resolve({ result });
        },
        getActionRun: () => Promise.reject(new Error('No runs.')),
    };
}

/**
 * Items in use: a backend can't delete an item that something else uses, and skips it with the
 * reason `in_use`. Alone, the toast names it, without "Undo"; with others, it says so after what
 * was deleted, and "Undo" puts back only those.
 */
export const InUse: Story = {
    args: { adapter: createInUseAdapter() },
    render: (args) => (
        // The definition gives the title of the items: `title`, on `pages`.
        <PanneauProvider definition={createExampleDefinition() as Definition}>
            <ActionRunnerProvider {...args}>
                <InUsePages />
            </ActionRunnerProvider>
        </PanneauProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Delete: Contact' }));
        const alone = await body.findByRole('alertdialog', {
            name: /“Contact” is in use elsewhere: remove it from where it is used, then try again\./,
        });
        await expect(within(alone).queryByRole('button', { name: 'Undo' })).toBeNull();
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Home' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Contact' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
        const several = await body.findByRole('alertdialog', { name: /is done for 1 page/ });
        await expect(several).toHaveTextContent(
            '1 item done. 1 item is in use elsewhere: remove it from where it is used, then try again.',
        );
        // The toast rises in from transparent: its button shows once it is in.
        await waitFor(() =>
            expect(within(several).getByRole('button', { name: 'Undo' })).toBeVisible(),
        );
    },
};

function InUsePages() {
    const runAction = useActionRunner('pages');
    return (
        <List
            aria-label="Pages"
            columns={[{ id: 'title', label: 'Title' }]}
            // Built-in actions are offered on the items that allow them.
            items={items.map((item) => ({ ...item, abilities: { delete: true } }))}
            actions={[remove]}
            onAction={runAction}
            router={null}
        />
    );
}
