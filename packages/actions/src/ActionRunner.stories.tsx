import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { List } from '@panneau/lists';
import type { Action, ActionResult, ActionRun } from '@panneau/protocol';

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
        await expect(await body.findByText('1 page published.')).toBeVisible();
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
        await expect(await body.findByText('“Export” is running in the background.')).toBeVisible();
        const runs = await canvas.findByRole('list', { name: 'Actions in progress' });
        await expect(
            await within(runs).findByRole('progressbar', { name: 'Export' }),
        ).toBeInTheDocument();
        await expect(
            await body.findByText('3 pages exported.', {}, { timeout: 5000 }),
        ).toBeVisible();
        await expect(args.onDownload).toHaveBeenCalledWith({
            url: '#pages.csv',
            filename: 'pages.csv',
        });
        await expect(within(runs).getByText('Done')).toBeVisible();
    },
};
