import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, createList, definePlugin } from '@panneau/core';
import { ValidationError, createRestAdapter } from '@panneau/data';
import { fr } from '@panneau/intl';
import { ListView } from '@panneau/lists';
import type { Action, ActionResult, ActionRun } from '@panneau/protocol';
import { createExampleDefinition, createMockBackend } from '@panneau/protocol/mock';
import { Button, PanneauRoot } from '@panneau/ui';

import { ActionRunnerProvider, type ActionRunnerProviderProps } from './ActionRunnerProvider';
import { ActionRuns } from './ActionRuns';
import type { ActionAdapter, ActionOutcome, ActionTarget, ClientActionProps } from './types';
import { useActionRunner } from './useActionRunner';

const publish: Action = {
    id: 'publish',
    label: 'Publish',
    kind: 'server',
    scope: ['item', 'selection'],
};

const notify: Action = {
    id: 'notify',
    label: 'Notify',
    kind: 'server',
    scope: ['selection'],
    fields: [
        { name: 'note', type: 'text', label: 'Note', rules: [{ rule: 'required' }] },
        { name: 'urgent', type: 'boolean', label: 'Urgent' },
    ],
    confirm: { confirmLabel: 'Send' },
};

function createAdapter(overrides: Partial<ActionAdapter> = {}): ActionAdapter {
    return {
        runAction: vi.fn(() => Promise.resolve({ result: { message: 'Done.' } })),
        getActionRun: vi.fn(() => Promise.reject(new Error('No runs.'))),
        ...overrides,
    };
}

/** Renders a button that runs an action, and keeps what the run gave. */
function renderRunner(
    target: ActionTarget,
    props: Partial<ActionRunnerProviderProps> & { adapter: ActionAdapter },
    { children, wrap }: { children?: ReactNode; wrap?: (ui: ReactNode) => ReactNode } = {},
) {
    const outcomes: (ActionOutcome | false | Error)[] = [];
    function Run() {
        const run = useActionRunner('pages');
        return (
            <Button
                onPress={() => {
                    run(target).then(
                        (outcome) => outcomes.push(outcome),
                        (error: Error) => outcomes.push(error),
                    );
                }}
            >
                Run
            </Button>
        );
    }
    const ui = (
        <PanneauRoot>
            <ActionRunnerProvider {...props}>
                <Run />
                {children}
            </ActionRunnerProvider>
        </PanneauRoot>
    );
    render(wrap !== undefined ? wrap(ui) : ui);
    return { outcomes, run: () => userEvent.click(screen.getByRole('button', { name: 'Run' })) };
}

describe('ActionRunnerProvider', () => {
    it('runs an action on an item, and shows its result', async () => {
        const adapter = createAdapter();
        const onResult = vi.fn();
        const item = { id: '12', title: 'Home' };
        const { outcomes, run } = renderRunner(
            { action: publish, scope: 'item', item },
            { adapter, onResult },
        );
        await run();
        expect(await screen.findByText('Done.')).toBeInTheDocument();
        expect(adapter.runAction).toHaveBeenCalledWith('pages', 'publish', {
            selection: { ids: ['12'] },
            values: {},
        });
        expect(onResult).toHaveBeenCalledWith(
            { message: 'Done.' },
            { resource: 'pages', target: { action: publish, scope: 'item', item } },
        );
        expect(outcomes).toEqual([{ status: 'done', result: { message: 'Done.' } }]);
    });

    it('sends the selection, and no selection for the resource', async () => {
        const adapter = createAdapter();
        const selection = { query: { filter: { status: 'draft' } }, except: ['3'] };
        const first = renderRunner({ action: publish, scope: 'selection', selection }, { adapter });
        await first.run();
        await waitFor(() =>
            expect(adapter.runAction).toHaveBeenLastCalledWith('pages', 'publish', {
                selection,
                values: {},
            }),
        );
    });

    it('counts what didn’t succeed, and lists those items with why', async () => {
        const user = userEvent.setup();
        const result: ActionResult = {
            summary: { succeeded: 10, failed: 1, skipped: 2 },
            results: [
                { id: '14', status: 'failed', message: 'The title is required.' },
                { id: '15', status: 'skipped', reason: 'forbidden' },
                { id: '16', status: 'skipped', reason: 'unchanged' },
            ],
        };
        const adapter = createAdapter({ runAction: () => Promise.resolve({ result }) });
        const { run } = renderRunner(
            { action: publish, scope: 'selection', selection: { ids: ['14', '15'] } },
            { adapter },
        );
        await run();
        expect(await screen.findByText('“Publish” is done.')).toBeInTheDocument();
        expect(screen.getByText('10 items done, 1 failed, 2 skipped')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Details' }));
        const dialog = await screen.findByRole('dialog', { name: '“Publish”: items not done' });
        const rows = within(dialog).getAllByRole('listitem');
        expect(rows.map((row) => row.textContent)).toEqual([
            'Item 14FailedThe title is required.',
            'Item 15SkippedNot allowed',
            'Item 16SkippedUnchanged',
        ]);
        // The close button of the dialog, then the one of its footer.
        await user.click(
            within(dialog).getAllByRole('button', { name: 'Close' })[1] as HTMLElement,
        );
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('opens the download, and follows the redirect', async () => {
        const download = { url: 'https://example.com/pages.csv', filename: 'pages.csv' };
        const adapter = createAdapter({
            runAction: vi.fn(() => Promise.resolve({ result: { download, redirect: '/exports' } })),
        });
        const onDownload = vi.fn();
        const onNavigate = vi.fn();
        const { run } = renderRunner(
            { action: { ...publish, id: 'export', label: 'Export' }, scope: 'resource' },
            { adapter, onDownload, onNavigate },
        );
        await run();
        await waitFor(() => expect(onDownload).toHaveBeenCalledWith(download));
        expect(onNavigate).toHaveBeenCalledWith('/exports');
        expect(adapter.runAction).toHaveBeenCalledWith('pages', 'export', { values: {} });
        // The toast offers the download again.
        await userEvent.click(screen.getByRole('button', { name: 'Download' }));
        expect(onDownload).toHaveBeenCalledTimes(2);
    });

    it('opens a download with a link by default', async () => {
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement,
        ) {
            expect(this.href).toBe('https://example.com/pages.csv');
            expect(this.download).toBe('pages.csv');
        });
        const adapter = createAdapter({
            runAction: () =>
                Promise.resolve({
                    result: {
                        download: { url: 'https://example.com/pages.csv', filename: 'pages.csv' },
                    },
                }),
        });
        const { run } = renderRunner({ action: publish, scope: 'resource' }, { adapter });
        await run();
        await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
        click.mockRestore();
    });

    it('rejects when the action fails', async () => {
        const adapter = createAdapter({
            runAction: () => Promise.reject(new Error('The server is down.')),
        });
        const { outcomes, run } = renderRunner({ action: publish, scope: 'resource' }, { adapter });
        await run();
        await waitFor(() => expect(outcomes).toEqual([new Error('The server is down.')]));
    });

    describe('parameters', () => {
        it('asks for them in a dialog, validates them, then runs the action', async () => {
            const user = userEvent.setup();
            const adapter = createAdapter();
            const { outcomes, run } = renderRunner(
                { action: notify, scope: 'selection', selection: { ids: ['1'] }, count: 1 },
                { adapter },
            );
            await run();
            const dialog = await screen.findByRole('dialog', { name: 'Notify' });
            await user.click(within(dialog).getByRole('button', { name: 'Send' }));
            expect(await within(dialog).findByText('This field is required.')).toBeInTheDocument();
            expect(adapter.runAction).not.toHaveBeenCalled();

            await user.type(within(dialog).getByRole('textbox', { name: 'Note' }), 'Hello');
            await user.click(within(dialog).getByRole('checkbox', { name: 'Urgent' }));
            await user.click(within(dialog).getByRole('button', { name: 'Send' }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(adapter.runAction).toHaveBeenCalledWith('pages', 'notify', {
                selection: { ids: ['1'] },
                values: { note: 'Hello', urgent: true },
            });
            expect(outcomes).toEqual([{ status: 'done', result: { message: 'Done.' } }]);
        });

        it('shows the validation errors of the action endpoint on the fields', async () => {
            const user = userEvent.setup();
            const runAction = vi
                .fn<ActionAdapter['runAction']>()
                .mockRejectedValueOnce(
                    new ValidationError({
                        type: 'urn:panneau:problem:validation',
                        title: 'Invalid',
                        status: 422,
                        errors: { note: ['The note is too rude.'] },
                    }),
                )
                .mockResolvedValueOnce({ result: { message: 'Sent.' } });
            const { run } = renderRunner(
                { action: notify, scope: 'selection', selection: { ids: ['1'] } },
                { adapter: createAdapter({ runAction }) },
            );
            await run();
            const dialog = await screen.findByRole('dialog', { name: 'Notify' });
            await user.type(within(dialog).getByRole('textbox', { name: 'Note' }), 'Rude');
            await user.click(within(dialog).getByRole('button', { name: 'Send' }));
            expect(await within(dialog).findByText('The note is too rude.')).toBeInTheDocument();
            expect(within(dialog).getByRole('textbox', { name: 'Note' })).toHaveAttribute(
                'aria-invalid',
                'true',
            );
            await user.clear(within(dialog).getByRole('textbox', { name: 'Note' }));
            await user.type(within(dialog).getByRole('textbox', { name: 'Note' }), 'Kind');
            await user.click(within(dialog).getByRole('button', { name: 'Send' }));
            expect(await screen.findByText('Sent.')).toBeInTheDocument();
            expect(runAction).toHaveBeenCalledTimes(2);
        });

        it('gives false when the user cancels them', async () => {
            const user = userEvent.setup();
            const adapter = createAdapter();
            const { outcomes, run } = renderRunner(
                { action: notify, scope: 'selection', selection: { ids: ['1'] } },
                { adapter },
            );
            await run();
            const dialog = await screen.findByRole('dialog', { name: 'Notify' });
            await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
            await waitFor(() => expect(outcomes).toEqual([false]));
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(adapter.runAction).not.toHaveBeenCalled();
        });
    });

    describe('queued runs', () => {
        const queued: ActionRun = {
            id: 'run_1',
            action: 'export',
            resource: 'pages',
            status: 'queued',
            progress: 0,
            total: 200,
        };
        const exportAction: Action = {
            id: 'export',
            label: 'Export',
            kind: 'server',
            scope: ['resource'],
        };

        it('follows a run until it ends, then shows its result', async () => {
            const result: ActionResult = { message: '200 pages exported.', refresh: 'none' };
            const getActionRun = vi
                .fn<ActionAdapter['getActionRun']>()
                .mockResolvedValueOnce({ ...queued, status: 'running', progress: 50 })
                .mockResolvedValue({ ...queued, status: 'succeeded', progress: 200, result });
            const adapter = createAdapter({
                runAction: () => Promise.resolve({ run: queued }),
                getActionRun,
            });
            const onResult = vi.fn();
            const { outcomes, run } = renderRunner(
                { action: exportAction, scope: 'resource' },
                { adapter, onResult, pollInterval: 10 },
                { children: <ActionRuns /> },
            );
            await run();
            expect(
                await screen.findByText('“Export” is running in the background.'),
            ).toBeInTheDocument();
            expect(outcomes).toEqual([{ status: 'queued', run: queued }]);
            const runs = screen.getByRole('list', { name: 'Actions in progress' });
            expect(await within(runs).findByText('50 of 200')).toBeInTheDocument();
            expect(within(runs).getByRole('progressbar', { name: 'Export' })).toHaveAttribute(
                'aria-valuenow',
                '50',
            );
            expect(await screen.findByText('200 pages exported.')).toBeInTheDocument();
            expect(within(runs).getByText('Done')).toBeInTheDocument();
            expect(onResult).toHaveBeenCalledTimes(1);
            expect(onResult).toHaveBeenCalledWith(
                result,
                expect.objectContaining({ resource: 'pages' }),
            );
            // Finished: no more checks.
            const calls = getActionRun.mock.calls.length;
            await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
            expect(getActionRun).toHaveBeenCalledTimes(calls);

            await userEvent.click(within(runs).getByRole('button', { name: 'Dismiss “Export”' }));
            expect(
                screen.queryByRole('list', { name: 'Actions in progress' }),
            ).not.toBeInTheDocument();
        });

        it('cancels a run, when the adapter can', async () => {
            const cancelActionRun = vi.fn(() => Promise.resolve());
            const getActionRun = vi
                .fn<ActionAdapter['getActionRun']>()
                .mockResolvedValue({ ...queued, status: 'cancelled' });
            const adapter = createAdapter({
                runAction: () => Promise.resolve({ run: queued }),
                getActionRun,
                cancelActionRun,
            });
            const { run } = renderRunner(
                { action: exportAction, scope: 'resource' },
                { adapter, pollInterval: 60_000 },
                { children: <ActionRuns /> },
            );
            await run();
            const runs = await screen.findByRole('list', { name: 'Actions in progress' });
            await userEvent.click(within(runs).getByRole('button', { name: 'Cancel “Export”' }));
            expect(cancelActionRun).toHaveBeenCalledWith('run_1');
            expect(await screen.findByText('“Export” was cancelled.')).toBeInTheDocument();
            expect(within(runs).getByText('Cancelled')).toBeInTheDocument();
        });

        it('says when a run failed, and offers no cancel without the adapter method', async () => {
            const adapter = createAdapter({
                runAction: () => Promise.resolve({ run: queued }),
                getActionRun: () => Promise.resolve({ ...queued, status: 'failed' }),
            });
            const { run } = renderRunner(
                { action: exportAction, scope: 'resource' },
                { adapter, pollInterval: 10 },
                { children: <ActionRuns /> },
            );
            await run();
            const runs = await screen.findByRole('list', { name: 'Actions in progress' });
            expect(within(runs).queryByRole('button', { name: /Cancel/ })).not.toBeInTheDocument();
            expect(await screen.findByText('“Export” failed.')).toBeInTheDocument();
        });
    });

    it('goes to the URL of a link action', async () => {
        const onNavigate = vi.fn();
        const adapter = createAdapter();
        const edit: Action = {
            id: 'edit',
            label: 'Edit',
            kind: 'link',
            url: '/pages/{id}/edit',
            scope: ['item'],
        };
        const { outcomes, run } = renderRunner(
            { action: edit, scope: 'item', item: { id: 'a b' } },
            { adapter, onNavigate },
        );
        await run();
        await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/pages/a%20b/edit'));
        expect(outcomes).toEqual([{ status: 'navigated', to: '/pages/a%20b/edit' }]);
        expect(adapter.runAction).not.toHaveBeenCalled();
    });

    it('renders the handler of a client action, from the plugins or the props', async () => {
        const user = userEvent.setup();
        function Share({ action, target, onDone, onCancel }: ClientActionProps) {
            return (
                <div role="region" aria-label={`${action.label} ${target.item?.id ?? ''}`}>
                    <Button onPress={() => onDone({ message: 'Shared.' })}>Share now</Button>
                    <Button onPress={onCancel}>Not now</Button>
                </div>
            );
        }
        const share: Action = {
            id: 'share',
            label: 'Share',
            kind: 'client',
            component: 'share-dialog',
            scope: ['item'],
        };
        const { outcomes, run } = renderRunner(
            { action: share, scope: 'item', item: { id: '7' } },
            { adapter: createAdapter() },
            {
                wrap: (ui) => (
                    <PanneauProvider
                        plugins={[
                            definePlugin({ id: 'share', actions: { 'share-dialog': Share } }),
                        ]}
                    >
                        {ui}
                    </PanneauProvider>
                ),
            },
        );
        await run();
        await user.click(
            within(await screen.findByRole('region', { name: 'Share 7' })).getByRole('button', {
                name: 'Share now',
            }),
        );
        expect(await screen.findByText('Shared.')).toBeInTheDocument();
        expect(outcomes).toEqual([{ status: 'done', result: { message: 'Shared.' } }]);

        await run();
        await user.click(await screen.findByRole('button', { name: 'Not now' }));
        await waitFor(() => expect(outcomes).toHaveLength(2));
        expect(outcomes[1]).toBe(false);
    });

    it('rejects a client action without a handler', async () => {
        const { outcomes, run } = renderRunner(
            {
                action: { ...publish, kind: 'client', component: 'missing' },
                scope: 'item',
                item: { id: '1' },
            },
            { adapter: createAdapter() },
        );
        await run();
        await waitFor(() =>
            expect(outcomes).toEqual([
                new Error('No handler for the client action "publish" (missing).'),
            ]),
        );
    });

    it('translates its messages', async () => {
        const adapter = createAdapter({
            runAction: () =>
                Promise.resolve({ result: { summary: { succeeded: 2, failed: 1, skipped: 0 } } }),
        });
        const { run } = renderRunner(
            { action: { ...publish, label: 'Publier' }, scope: 'resource' },
            { adapter },
            {
                wrap: (ui) => (
                    <IntlProvider locale="fr" messages={fr}>
                        {ui}
                    </IntlProvider>
                ),
            },
        );
        await run();
        expect(await screen.findByText('« Publier » est terminé.')).toBeInTheDocument();
        expect(screen.getByText('2 éléments traités et 1 échec')).toBeInTheDocument();
    });
});

describe('useActionRunner', () => {
    it('throws outside of a provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        function Outside() {
            useActionRunner('pages');
            return null;
        }
        expect(() => render(<Outside />)).toThrow(
            'useActionRunner() must be used inside <ActionRunnerProvider>.',
        );
        vi.restoreAllMocks();
    });

    it('is the onAction of a list, against a backend that implements the protocol', async () => {
        const user = userEvent.setup();
        const backend = createMockBackend({
            definition: createExampleDefinition(),
            items: {
                pages: [
                    { title: { fr: 'Accueil' }, status: 'published' },
                    { title: { fr: 'Contact' }, status: 'draft' },
                ],
            },
        });
        const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
        const remove: Action = {
            id: 'delete',
            label: 'Delete',
            kind: 'server',
            scope: ['item', 'selection'],
            placement: ['toolbar'],
        };
        const items = (await adapter.list('pages')).data;
        const list = createList();
        function Pages() {
            const runAction = useActionRunner('pages');
            return (
                <ListView
                    list={list}
                    columns={[{ id: 'status', label: 'Status' }]}
                    items={items}
                    actions={[remove]}
                    onAction={runAction}
                />
            );
        }
        const onResult = vi.fn();
        render(
            <PanneauRoot>
                <ActionRunnerProvider adapter={adapter} onResult={onResult}>
                    <Pages />
                </ActionRunnerProvider>
            </PanneauRoot>,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select draft' }));
        await user.click(screen.getByRole('button', { name: 'Delete' }));
        expect(await screen.findByText('1 deleted.')).toBeInTheDocument();
        expect(onResult).toHaveBeenCalledWith(
            expect.objectContaining({ refresh: 'list' }),
            expect.objectContaining({ resource: 'pages' }),
        );
        await waitFor(() => expect(list.getState().selection).toEqual({ mode: 'ids', ids: [] }));
        expect((await adapter.list('pages')).data.map((item) => item.status)).toEqual([
            'published',
        ]);
    });
});
