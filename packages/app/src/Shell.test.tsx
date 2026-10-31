import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type DefinitionInput, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';

function renderApp(overrides: Partial<DefinitionInput> = {}) {
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

    it('asks before leaving a form with unsaved changes through a link', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
        renderApp();
        const field = await screen.findByRole('textbox', { name: /name/i });
        await user.type(field, ' Lovelace');

        await user.click(navigation().getByRole('link', { name: 'Pages' }));
        const dialog = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        await user.click(within(dialog).getByRole('button', { name: 'Stay' }));
        expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit');
        expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Ada Lovelace');

        await user.click(navigation().getByRole('link', { name: 'Pages' }));
        await user.click(
            within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Leave' }),
        );
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/pages'));
    });

    it('asks before going back from a form with unsaved changes', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors');
        renderApp();
        await user.click(await screen.findByRole('link', { name: 'Ada' }));
        await user.click(
            within(await screen.findByRole('region', { name: 'Details of the author' })).getByRole(
                'link',
                { name: 'Edit' },
            ),
        );
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit'),
        );
        await user.type(await screen.findByRole('textbox', { name: /name/i }), '!');

        window.history.back();
        const dialog = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        // The browser is back on the form while the dialog asks
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit'),
        );
        await user.click(within(dialog).getByRole('button', { name: 'Leave' }));
        // Back on the panel the form was opened from
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/authors/1'));
    });

    it('names the tab after the page, and moves focus to its title', async () => {
        const user = userEvent.setup();
        const resources = createDefinition().resources.map((resource) => ({
            ...resource,
            itemTitle: resource.fields[0]?.name,
        }));
        renderApp({ resources });
        await waitFor(() => expect(document.title).toBe('Test site'));

        await user.click(navigation().getByRole('link', { name: 'Pages' }));
        await waitFor(() => expect(document.title).toBe('Pages · Test site'));
        await waitFor(() =>
            expect(screen.getByRole('heading', { level: 1, name: 'Pages' })).toHaveFocus(),
        );

        await user.click(await screen.findByRole('link', { name: 'Contact' }));
        await waitFor(() => expect(document.title).toBe('Contact · Pages · Test site'));
        // The panel takes focus, then closing it gives it back to the item's link
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        await waitFor(() => expect(panel).toHaveFocus());
        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.getByRole('link', { name: 'Contact' })).toHaveFocus());
    });

    it("links the user to their profile, the user's item in the resource users", async () => {
        const user = userEvent.setup();
        renderApp({
            resources: [
                ...createDefinition().resources,
                {
                    id: 'users',
                    label: { singular: 'user', plural: 'users' },
                    fields: [{ name: 'name', type: 'text' }],
                },
            ],
        });
        await user.click(
            within(screen.getByRole('complementary')).getByRole('link', { name: /Ada/ }),
        );
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/users/usr_1/edit'),
        );
        expect(
            within(screen.getByRole('complementary')).getByRole('link', { name: /Ada/ }),
        ).toHaveAttribute('aria-current', 'page');
    });

    it('pages a list with cursors, back and forth, without page numbers', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    list: { pagination: 'cursor', perPage: 1 },
                },
            ],
        });
        const main = within(screen.getByRole('main'));
        expect(await main.findByText('About us')).toBeInTheDocument();
        const pagination = within(main.getByRole('navigation', { name: 'Pagination' }));
        expect(pagination.queryByText(/of/)).not.toBeInTheDocument();
        expect(pagination.getByRole('button', { name: 'Previous page' })).toBeDisabled();

        await user.click(pagination.getByRole('button', { name: 'Next page' }));
        expect(await main.findByText('Contact')).toBeInTheDocument();
        expect(window.location.search).toBe('?cursor=o1');
        expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();

        await user.click(pagination.getByRole('button', { name: 'Previous page' }));
        expect(await main.findByText('About us')).toBeInTheDocument();
        expect(window.location.search).toBe('');
    });

    it('shows the actions placed in form on the edit page of an item, runs them, and leaves the page of a deleted item', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages/1/edit');
        const backend = renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    actions: [
                        {
                            id: 'edit',
                            label: 'Edit',
                            kind: 'link',
                            url: '/panneau/resources/pages/{id}/edit',
                            scope: ['item'],
                        },
                        {
                            id: 'site',
                            label: 'View on the site',
                            kind: 'link',
                            url: '/site/{id}',
                            scope: ['item'],
                            placement: ['form'],
                        },
                        { id: 'publish', label: 'Publish', scope: ['item'], placement: ['row'] },
                        {
                            id: 'delete',
                            label: 'Delete',
                            scope: ['item'],
                            destructive: true,
                            confirm: true,
                        },
                    ],
                },
            ],
        });
        const main = within(screen.getByRole('main'));
        expect(await main.findByRole('link', { name: 'View on the site' })).toHaveAttribute(
            'href',
            '/site/1',
        );
        // Placed in `row` only, and the page's own action
        expect(main.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
        expect(main.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();

        await user.click(main.getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('alertdialog');
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        expect(await screen.findByText('1 deleted.')).toBeInTheDocument();
        expect(backend.items('pages').map((page) => page.id)).toEqual(['2']);
        // The item is gone: back to the list, in place of its page
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/pages'));
        expect(await screen.findByRole('table', { name: 'Pages' })).toBeInTheDocument();
        expect(screen.queryByText('About us')).not.toBeInTheDocument();
    });
});
