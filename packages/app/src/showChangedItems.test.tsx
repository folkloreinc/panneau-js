import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ClientActionProps } from '@panneau/actions';
import { type PanneauPlugin, definePlugin } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { type DefinitionInput, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';

function renderApp(
    overrides: Partial<DefinitionInput> = {},
    plugins: PanneauPlugin[] = [],
    // Changes the items of the backend before the app fetches them
    prepare?: (backend: ReturnType<typeof createMockBackend>) => void,
) {
    const definition = createDefinition({
        menus: { main: [{ type: 'resources' }, { type: 'link', label: 'Site', url: '/' }] },
        ...overrides,
    });
    const backend = createMockBackend({
        definition,
        items: {
            pages: [
                { id: '1', title: 'About us' },
                { id: '2', title: 'Contact' },
            ],
            authors: [{ id: '1', name: 'Ada' }],
        },
    });
    prepare?.(backend);
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            iconLoader={null}
            plugins={plugins}
            onUnauthorized={vi.fn()}
        />,
    );
    return backend;
}

// Apart from the shell's tests: these change the query of a list through its router, in the
// history that the tests of a file share.
describe('"Show" and the filter on ids (decision 0069)', () => {
    it('opens the list of the items a selection action changed with "Show" in its toast', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages?q=o');
        function Feature({ target, onDone }: ClientActionProps) {
            return (
                <button
                    type="button"
                    onClick={() => onDone({ message: `${String(target.count)} pages featured.` })}
                >
                    Feature now
                </button>
            );
        }
        const pages = createDefinition().resources[0];
        renderApp(
            {
                resources: [
                    {
                        ...(pages as NonNullable<typeof pages>),
                        actions: [
                            {
                                id: 'feature',
                                label: 'Feature',
                                kind: 'client',
                                component: 'feature',
                                scope: ['selection'],
                                placement: ['toolbar'],
                            },
                        ],
                    },
                ],
            },
            [definePlugin({ id: 'featured', actions: { feature: Feature } })],
        );
        const table = await screen.findByRole('table', { name: 'Pages' });
        await user.click(await screen.findByRole('button', { name: 'Select' }));
        await user.click(await within(table).findByRole('checkbox', { name: 'Select Contact' }));
        await user.click(screen.getByRole('button', { name: 'Feature' }));
        await user.click(await screen.findByRole('button', { name: 'Feature now' }));
        const toast = await screen.findByRole('alertdialog', { name: /1 pages featured\./ });
        await user.click(within(toast).getByRole('button', { name: 'Show' }));
        await waitFor(() => expect(window.location.search).toBe('?filter%5Bids%5D%5B%5D=2'));
        await waitFor(() =>
            expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
                '1 item',
            ),
        );
        await waitFor(() => expect(within(table).queryByText('About us')).toBeNull());
        expect(within(table).getByText('Contact')).toBeInTheDocument();
    });

    it('lists the items of filter[ids], with a chip that shows the whole list again', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages?filter[ids][]=2');
        renderApp();
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(await within(table).findByText('Contact')).toBeInTheDocument();
        expect(within(table).queryByText('About us')).toBeNull();
        const chips = screen.getByRole('list', { name: 'Active filters' });
        expect(chips).toHaveTextContent('1 item');
        await user.click(within(chips).getByRole('button', { name: 'Remove the filter 1 item' }));
        expect(await within(table).findByText('About us')).toBeInTheDocument();
        expect(window.location.search).toBe('');
    });
});
