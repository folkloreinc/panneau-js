import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';

function renderApp() {
    const definition = createDefinition({
        menus: { main: [{ type: 'resources' }, { type: 'link', label: 'Site', url: '/' }] },
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
            onUnauthorized={vi.fn()}
        />,
    );
    return backend;
}

const navigation = () => within(screen.getByRole('navigation', { name: 'Main navigation' }));

describe('the app shell', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        window.localStorage.clear();
    });

    it('marks the home page as current, and links to each resource from it', () => {
        renderApp();
        expect(navigation().getByRole('link', { name: 'Home' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        const main = within(screen.getByRole('main'));
        expect(main.getByText('Welcome, Ada.')).toBeInTheDocument();
        expect(main.getByRole('link', { name: 'Authors' })).toHaveAttribute(
            'href',
            '/panneau/resources/authors',
        );
    });

    it('collapses the sidebar to icons, and remembers it', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(screen.getByRole('button', { name: 'Collapse the sidebar' }));
        const expand = screen.getByRole('button', { name: 'Expand the sidebar' });
        expect(expand).toHaveAttribute('aria-expanded', 'false');
        // The labels of the links are their accessible names.
        expect(navigation().getByRole('link', { name: 'Pages' })).toHaveAttribute(
            'aria-label',
            'Pages',
        );
        expect(window.localStorage.getItem('panneau:sidebar')).toBe('collapsed');

        await user.keyboard('{Control>}\\{/Control}');
        expect(screen.getByRole('button', { name: 'Collapse the sidebar' })).toBeInTheDocument();
    });

    it('lists the items of a resource, and shows one in a panel next to the list', async () => {
        const user = userEvent.setup();
        renderApp();
        await user.click(navigation().getByRole('link', { name: 'Pages' }));
        const table = await screen.findByRole('table', { name: 'Pages' });
        await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(3));

        await user.click(within(table).getByRole('link', { name: 'Contact' }));
        expect(window.location.pathname).toBe('/panneau/resources/pages/2');
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        expect(await within(panel).findByText('Contact')).toBeInTheDocument();
        await waitFor(() => expect(panel).toHaveFocus());
        // The list stays, with the item marked as the current one.
        expect(within(table).getByRole('link', { name: 'Contact' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(navigation().getByRole('link', { name: 'Pages' })).toHaveAttribute(
            'aria-current',
            'page',
        );

        await user.click(within(panel).getByRole('link', { name: 'Edit' }));
        expect(window.location.pathname).toBe('/panneau/resources/pages/2/edit');
        // Without an `itemTitle`, the heading names the resource.
        expect(screen.getByRole('heading', { name: 'Edit the page' })).toBeInTheDocument();
        expect(await screen.findByRole('textbox', { name: /title/i })).toHaveValue('Contact');
    });

    it('opens the panel of the show route over its list, and closes it without losing the query', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages/1?sort=-title');
        renderApp();
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        expect(await within(panel).findByText('About us')).toBeInTheDocument();
        expect(await screen.findByRole('table', { name: 'Pages' })).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(window.location.pathname).toBe('/panneau/resources/pages');
        expect(window.location.search).toBe('?sort=-title');
        expect(screen.queryByRole('region', { name: 'Details of the page' })).toBeNull();
    });

    it('creates an item, then opens its edit page', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/create');
        const backend = renderApp();
        expect(screen.getByRole('heading', { name: 'New author' })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Grace');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() =>
            expect(window.location.pathname).toMatch(
                /^\/panneau\/resources\/authors\/[^/]+\/edit$/,
            ),
        );
        expect(backend.items('authors').map((author) => author.name)).toEqual(['Ada', 'Grace']);
    });

    it('shows a page for paths that match nothing', () => {
        window.history.replaceState(null, '', '/panneau/resources/unknown');
        renderApp();
        expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
            'href',
            '/panneau',
        );
    });
});
