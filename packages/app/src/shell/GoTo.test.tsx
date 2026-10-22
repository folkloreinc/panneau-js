import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PanneauPlugin } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from '../Panneau';
import { createBootConfig, createDefinition } from '../__fixtures__/definition';

function renderApp(plugins: PanneauPlugin[] = []) {
    const definition = createDefinition({
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                itemSubtitle: 'status',
                fields: [
                    { name: 'title', type: 'text', label: 'Title' },
                    { name: 'status', type: 'text', label: 'Status' },
                ],
                list: { search: true },
            },
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                itemTitle: 'name',
                fields: [{ name: 'name', type: 'text', label: 'Name' }],
                abilities: { viewAny: true, create: false },
            },
        ],
    });
    const backend = createMockBackend({
        definition,
        items: {
            pages: [
                { id: '1', title: 'About us', status: 'Published' },
                { id: '2', title: 'Contact', status: 'Draft' },
            ],
            authors: [{ id: '1', name: 'Ada' }],
        },
    });
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            plugins={plugins}
            iconLoader={null}
            onUnauthorized={vi.fn()}
        />,
    );
}

// The button of the sidebar; the top bar of a phone has another one.
const goToButton = () =>
    within(screen.getByRole('complementary')).getByRole('button', { name: /Go to…/ });
const palette = () => within(screen.getByRole('dialog', { name: 'Go to…' }));
const labels = () =>
    palette()
        .getAllByRole('menuitem')
        .map((item) => item.textContent);

describe('the "Go to…" palette', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        window.localStorage.clear();
    });

    it('opens with Ctrl+K, and goes to navigation and create entries', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.keyboard('{Control>}k{/Control}');
        const field = palette().getByRole('searchbox', { name: 'Go to…' });
        await user.type(field, 'auth');
        expect(labels()).toEqual(['Authors']);
        await user.keyboard('{ArrowDown}{Enter}');
        expect(window.location.pathname).toBe('/panneau/resources/authors');

        await user.click(goToButton());
        await user.type(palette().getByRole('searchbox'), 'new');
        // Authors can't be created by this user.
        expect(labels()).toEqual(['New page']);
        await user.keyboard('{ArrowDown}{Enter}');
        expect(window.location.pathname).toBe('/panneau/resources/pages/create');
    });

    it('searches the server, and opens a result in its form', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(goToButton());
        await user.type(palette().getByRole('searchbox'), 'conta');
        const result = await palette().findByRole('menuitem', { name: /Contact/ });
        // The subtitle of the item, from `itemSubtitle`.
        expect(result).toHaveTextContent('Draft');
        expect(palette().getByRole('group', { name: 'Pages' })).toContainElement(result);
        await user.click(result);
        expect(window.location.pathname).toBe('/panneau/resources/pages/2/edit');

        // The item is now a recent one.
        await waitFor(() =>
            expect(window.localStorage.getItem('panneau:recent:/panneau:usr_1')).toContain(
                'Contact',
            ),
        );
        await user.keyboard('{Control>}k{/Control}');
        expect(palette().getByRole('group', { name: 'Recent' })).toHaveTextContent('Contact');
    });

    it('runs the actions of the app and the commands of plugins', async () => {
        const user = userEvent.setup();
        const perform = vi.fn();
        renderApp([
            {
                id: 'site',
                commands: [
                    {
                        id: 'clear',
                        label: 'Clear the cache',
                        group: 'Site',
                        keywords: ['purge'],
                        perform,
                    },
                ],
            },
        ]);
        await user.click(goToButton());
        await user.type(palette().getByRole('searchbox'), 'purge');
        expect(palette().getByRole('group', { name: 'Site' })).toBeInTheDocument();
        await user.click(palette().getByRole('menuitem', { name: 'Clear the cache' }));
        expect(perform).toHaveBeenCalledOnce();

        await user.click(goToButton());
        await user.type(palette().getByRole('searchbox'), 'collapse');
        await user.keyboard('{ArrowDown}{Enter}');
        expect(screen.getByRole('button', { name: 'Expand the sidebar' })).toBeInTheDocument();
    });
});
