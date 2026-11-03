/**
 * The notification area of the shell: a button shown while the action runner follows queued runs,
 * with the count of those in progress. It opens their status and progress in a popover.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type ActionAdapter, ActionRunnerProvider, useActionRunner } from '@panneau/actions';
import type { ActionRun } from '@panneau/protocol';
import { Button, Inline } from '@panneau/ui';

import { ActionRunsButton, type ActionRunsButtonProps } from './ActionRunsButton';

/** An adapter in memory: `export` is queued, then runs for as many checks as `steps`. */
function createStoryAdapter(steps: number): ActionAdapter {
    let count = 0;
    const checks = new Map<string, number>();
    return {
        runAction: () => {
            count += 1;
            const run: ActionRun = {
                id: `run_${String(count)}`,
                action: 'export',
                resource: 'pages',
                status: 'queued',
                progress: 0,
                total: steps,
            };
            checks.set(run.id, 0);
            return Promise.resolve({ run });
        },
        getActionRun: (id) => {
            const check = (checks.get(id) ?? 0) + 1;
            checks.set(id, check);
            const run: ActionRun = {
                id,
                action: 'export',
                resource: 'pages',
                status: check < steps ? 'running' : 'succeeded',
                progress: Math.min(check, steps),
                total: steps,
            };
            return Promise.resolve(
                check < steps ? run : { ...run, result: { message: 'The pages were exported.' } },
            );
        },
        cancelActionRun: () => Promise.resolve(),
    };
}

function Start() {
    const runAction = useActionRunner('pages');
    return (
        <Button
            onPress={() => {
                void runAction({
                    action: { id: 'export', label: 'Export', kind: 'server', scope: ['resource'] },
                    scope: 'resource',
                });
            }}
        >
            Export the pages
        </Button>
    );
}

function Story({ steps, ...props }: ActionRunsButtonProps & { steps: number }) {
    return (
        <ActionRunnerProvider adapter={createStoryAdapter(steps)} pollInterval={200}>
            <Inline gap={3} align="center">
                <Start />
                <div style={{ width: '14rem' }}>
                    <ActionRunsButton {...props} />
                </div>
            </Inline>
        </ActionRunnerProvider>
    );
}

const meta = {
    title: 'App/Action runs',
    component: Story,
    args: { steps: 1000 },
} satisfies Meta<typeof Story>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing until a run is queued. Then the row counts the runs in progress, and opens them. */
export const Row: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.queryByRole('button', { name: /^Actions/ })).toBeNull();
        await userEvent.click(canvas.getByRole('button', { name: 'Export the pages' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Export the pages' }));
        const button = await canvas.findByRole('button', { name: 'Actions, 2 in progress' });
        await userEvent.click(button);
        const popover = await body.findByRole('dialog', { name: 'Actions' });
        const runs = within(popover).getByRole('list', { name: 'Actions in progress' });
        await expect(within(runs).getAllByRole('progressbar', { name: 'Export' })).toHaveLength(2);
    },
};

/** In the rail of icons and the top bar: the icon, with the count on a badge. */
export const Icon: Story = {
    args: { appearance: 'icon' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Export the pages' }));
        await expect(
            await canvas.findByRole('button', { name: 'Actions, 1 in progress' }),
        ).toBeVisible();
    },
};

/** A run that ended stays in the popover until it is dismissed, and the button goes with it. */
export const Ended: Story = {
    args: { steps: 2 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Export the pages' }));
        const button = await canvas.findByRole('button', { name: 'Actions' }, { timeout: 3000 });
        await userEvent.click(button);
        const popover = await body.findByRole('dialog', { name: 'Actions' });
        // Once the popover has faded in
        await waitFor(() => expect(within(popover).getByText('Done')).toBeVisible());
        await userEvent.click(within(popover).getByRole('button', { name: 'Dismiss “Export”' }));
        await waitFor(() => expect(canvas.queryByRole('button', { name: /^Actions/ })).toBeNull());
    },
};
