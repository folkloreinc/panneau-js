import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

/** `renderApp()`, and a way to unmount the app between two routes of a test. */
function renderAppResult(...args: Parameters<typeof renderApp>) {
    return { backend: renderApp(...args), unmount: cleanup };
}

/** The app with authors that the user can or can't list and create. */
function renderForbidden(abilities: { viewAny: boolean; create: boolean }) {
    return renderAppResult({
        resources: [
            {
                id: 'authors',
                label: { singular: 'author', plural: 'authors' },
                itemTitle: 'name',
                fields: [{ name: 'name', type: 'text', label: 'Name' }],
                abilities,
            },
        ],
    });
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

    it('creates an item, then goes back to the list, which highlights it without a toast', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/create');
        const backend = renderApp();
        expect(screen.getByRole('heading', { name: 'New author' })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Grace');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/authors'));
        expect(backend.items('authors').map((author) => author.name)).toEqual(['Ada', 'Grace']);
        // The list shows the new item: highlighted, without a toast (decision 0066)
        const table = await screen.findByRole('table', { name: 'Authors' });
        await waitFor(() =>
            expect(table.querySelector('[data-highlighted]')).toHaveTextContent('Grace'),
        );
        expect(table.querySelectorAll('[data-highlighted]')).toHaveLength(1);
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('checks a slug with the backend in the form of an item, and shows its URL', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/create');
        const backend = renderApp({
            resources: [
                {
                    id: 'authors',
                    label: { singular: 'author', plural: 'authors' },
                    itemTitle: 'name',
                    fields: [
                        { name: 'name', type: 'text', label: 'Name' },
                        {
                            name: 'slug',
                            type: 'slug',
                            label: 'Address',
                            from: 'name',
                            check: true,
                            settings: { prefix: 'https://example.com/' },
                        },
                    ],
                },
            ],
        });
        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Grace');
        // The slug follows the name, and the backend's check gives its URL
        await waitFor(() =>
            expect(
                screen.getByRole('link', { name: 'Open the page in a new window' }),
            ).toHaveAttribute('href', 'https://example.com/grace'),
        );
        expect(backend.items('authors')).toHaveLength(1);
    });

    it('says the item was created when the list doesn’t show it, with a link to open it', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/create');
        const backend = renderApp();
        // More authors than a page of the list shows: the new one comes after them
        for (let index = 2; index <= 30; index += 1) {
            await backend.fetch('/panneau/api/resources/authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Author ${index}` }),
            });
        }
        await user.type(screen.getByRole('textbox', { name: /name/i }), 'Grace');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/authors'));
        const toast = await screen.findByRole('alertdialog');
        expect(toast).toHaveTextContent('The author was created.');
        await user.click(within(toast).getByRole('button', { name: 'Open' }));
        await waitFor(() =>
            expect(window.location.pathname).toMatch(/^\/panneau\/resources\/authors\/[^/]+/),
        );
    });

    it('says "Saved" in the footer of a form, not in a toast, after it starts over', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
        renderApp();
        const field = await screen.findByRole('textbox', { name: /name/i });
        await user.type(field, ' Lovelace');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        const form = await screen.findByRole('form');
        await waitFor(() => expect(within(form).getByRole('status')).toHaveTextContent('Saved'));
        expect(screen.queryByRole('alertdialog')).toBeNull();
        await user.type(screen.getByRole('textbox', { name: /name/i }), '!');
        expect(within(form).getByRole('status')).toHaveTextContent('Unsaved changes');
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

    describe('with a dock (decision 0076)', () => {
        const dock = { theme: { navigation: 'dock' as const } };

        it('shows the menu in a dock instead of the sidebar, where nothing collapses', async () => {
            const user = userEvent.setup();
            renderApp(dock);
            expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', { name: 'Collapse the sidebar' }),
            ).not.toBeInTheDocument();
            expect(navigation().getByRole('link', { name: 'Home' })).toHaveAttribute(
                'aria-current',
                'page',
            );

            await user.click(navigation().getByRole('link', { name: 'Pages' }));
            expect(window.location.pathname).toBe('/panneau/resources/pages');
            expect(navigation().getByRole('link', { name: 'Pages' })).toHaveAttribute(
                'aria-current',
                'page',
            );
            await user.keyboard('{Control>}\\{/Control}');
            expect(window.localStorage.getItem('panneau:sidebar')).toBeNull();
        });

        it('opens the links of a group in a menu', async () => {
            const user = userEvent.setup();
            renderApp({
                ...dock,
                menus: {
                    main: [
                        {
                            type: 'group',
                            label: 'Content',
                            children: [
                                { type: 'resource', resource: 'pages' },
                                { type: 'resource', resource: 'authors' },
                            ],
                        },
                    ],
                },
            });
            await user.click(navigation().getByRole('button', { name: 'Content' }));
            const menu = await screen.findByRole('menu', { name: 'Content' });
            await user.click(within(menu).getByRole('menuitem', { name: 'Authors' }));
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors'),
            );
            expect(navigation().getByRole('button', { name: 'Content' })).toHaveAttribute(
                'data-current',
                'true',
            );
        });

        it('puts the entries after the first three in "More", for phones', async () => {
            const user = userEvent.setup();
            renderApp(dock);
            await user.click(navigation().getByRole('button', { name: 'More' }));
            const menu = await screen.findByRole('menu', { name: 'More' });
            expect(
                within(menu)
                    .getAllByRole('menuitem')
                    .map((item) => item.textContent),
            ).toEqual(['Site']);
        });

        it("changes the color scheme from the user's menu", async () => {
            const user = userEvent.setup();
            renderApp(dock);
            await user.click(screen.getByRole('button', { name: 'Ada' }));
            // The menu is named after its button
            const menu = await screen.findByRole('menu', { name: 'Ada' });
            expect(within(menu).getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
                'aria-checked',
                'true',
            );
            await user.click(within(menu).getByRole('menuitemradio', { name: 'Dark' }));
            expect(window.localStorage.getItem('panneau:color-scheme')).toBe('dark');
        });
    });

    describe('error pages', () => {
        it('shows the error page of a page that throws, with the sidebar, and renders it again', async () => {
            const user = userEvent.setup();
            let fail = true;
            function Report() {
                if (fail) {
                    throw new Error('The report broke.');
                }
                return <h1>Report</h1>;
            }
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
            window.history.replaceState(null, '', '/panneau/pages/report');
            renderApp({ pages: { report: { component: 'report', label: 'Report' } } }, [
                definePlugin({ id: 'reports', pages: { report: Report } }),
            ]);
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'This page ran into a problem',
            );
            expect(navigation().getByRole('link', { name: 'Pages' })).toBeInTheDocument();
            fail = false;
            await user.click(screen.getByRole('button', { name: 'Try again' }));
            expect(await screen.findByRole('heading', { name: 'Report' })).toBeInTheDocument();
        });

        it('shows the error page of a list that fails to load, with a retry', async () => {
            const user = userEvent.setup();
            let fail = true;
            window.history.replaceState(null, '', '/panneau/resources/pages');
            renderApp({}, [], (backend) => {
                const { fetch } = backend;
                backend.fetch = (input, init) =>
                    fail
                        ? Promise.resolve(
                              new Response(
                                  JSON.stringify({
                                      type: 'about:blank',
                                      title: 'Oops',
                                      status: 500,
                                  }),
                                  {
                                      status: 500,
                                      headers: { 'Content-Type': 'application/problem+json' },
                                  },
                              ),
                          )
                        : fetch(input, init);
            });
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'The server ran into a problem.',
            );
            fail = false;
            await user.click(screen.getByRole('button', { name: 'Try again' }));
            expect(await screen.findByRole('heading', { name: 'Pages' })).toBeInTheDocument();
        });

        it('shows the forbidden page of an item the user can’t see', async () => {
            window.history.replaceState(null, '', '/panneau/resources/pages/1/edit');
            renderApp({}, [], (backend) => {
                const { fetch } = backend;
                backend.fetch = (input, init) =>
                    String(input).endsWith('/resources/pages/1')
                        ? Promise.resolve(
                              new Response(
                                  JSON.stringify({
                                      type: 'about:blank',
                                      title: 'Forbidden',
                                      status: 403,
                                  }),
                                  {
                                      status: 403,
                                      headers: { 'Content-Type': 'application/problem+json' },
                                  },
                              ),
                          )
                        : fetch(input, init);
            });
            expect(
                await screen.findByRole('heading', { name: 'Access denied' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
                'href',
                '/panneau',
            );
        });
    });

    describe('a page with params', () => {
        function JobPage({ params, title }: { params: { id: string }; title: string }) {
            return <h1>{`${title} ${params.id}`}</h1>;
        }
        const plugins = [definePlugin({ id: 'jobs', pages: { job: JobPage } })];
        const overrides: Partial<DefinitionInput> = {
            pages: {
                job: { component: 'job', label: 'Job', params: ['id'], props: { title: 'Job' } },
            },
            menus: { main: [{ type: 'resources' }, { type: 'page', page: 'job' }] },
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    actions: [
                        {
                            id: 'timeline',
                            label: 'Timeline',
                            kind: 'link',
                            route: 'job',
                            scope: ['item'],
                            placement: ['row'],
                        },
                    ],
                },
            ],
        };

        it('gives the segments of its path to its component, as its params', () => {
            window.history.replaceState(null, '', '/panneau/pages/job/a%2F1');
            renderApp(overrides, plugins);
            expect(screen.getByRole('heading', { name: 'Job a/1' })).toBeInTheDocument();
            // A menu can't link to a page about one thing.
            expect(navigation().queryByRole('link', { name: 'Job' })).not.toBeInTheDocument();
        });

        it('is not found without its params, or with more', () => {
            window.history.replaceState(null, '', '/panneau/pages/job');
            renderApp(overrides, plugins);
            expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
        });

        it('opens from a route reference that names it', async () => {
            const user = userEvent.setup();
            window.history.replaceState(null, '', '/panneau/resources/pages');
            renderApp(overrides, plugins);
            // Resolved to the page's path, a link as in the panel and the form
            const link = await screen.findByRole('link', { name: 'Timeline: Contact' });
            expect(link).toHaveAttribute('href', '/panneau/pages/job/2');
            await user.click(link);
            expect(await screen.findByRole('heading', { name: 'Job 2' })).toBeInTheDocument();
            expect(window.location.pathname).toBe('/panneau/pages/job/2');
        });
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

    it('links each row to the edit and the show route with the built-in links', async () => {
        const user = userEvent.setup();
        renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    actions: [
                        { id: 'show', kind: 'link', scope: ['item'] },
                        { id: 'edit', kind: 'link', scope: ['item'] },
                    ],
                },
            ],
        });
        await user.click(navigation().getByRole('link', { name: 'Pages' }));
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(await within(table).findByRole('link', { name: 'Edit: Contact' })).toHaveAttribute(
            'href',
            '/panneau/resources/pages/2/edit',
        );

        await user.click(within(table).getByRole('link', { name: 'View: About us' }));
        expect(window.location.pathname).toBe('/panneau/resources/pages/1');
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        // The panel has its own link to edit, and doesn't repeat the built-in links
        expect(await within(panel).findAllByRole('link', { name: 'Edit' })).toHaveLength(1);
        expect(within(panel).queryByRole('link', { name: 'View' })).toBeNull();

        await user.click(within(table).getByRole('link', { name: 'Edit: Contact' }));
        expect(window.location.pathname).toBe('/panneau/resources/pages/2/edit');
        expect(await screen.findByRole('textbox', { name: 'Title' })).toHaveValue('Contact');
        // On the edit page, `edit` is the page itself
        expect(
            within(screen.getByRole('main')).queryByRole('link', { name: 'Edit' }),
        ).not.toBeInTheDocument();
    });

    it('opens the items of a resource with `"open": "edit"` in their form, and redirects its show route', async () => {
        const user = userEvent.setup();
        const authors = {
            id: 'authors',
            label: { singular: 'author', plural: 'authors' },
            itemTitle: 'name',
            open: 'edit',
            fields: [{ name: 'name', type: 'text', label: 'Name' }],
            actions: [
                { id: 'show', kind: 'link', scope: ['item'] },
                { id: 'edit', kind: 'link', scope: ['item'] },
            ],
        } satisfies DefinitionInput['resources'][number];
        renderApp({ resources: [authors] });
        await user.click(navigation().getByRole('link', { name: 'Authors' }));
        const table = await screen.findByRole('table', { name: 'Authors' });
        expect(await within(table).findByRole('link', { name: 'Ada' })).toHaveAttribute(
            'href',
            '/panneau/resources/authors/1/edit',
        );
        // `show` would open the form too: only `edit` is left
        expect(within(table).getByRole('link', { name: 'Edit: Ada' })).toBeInTheDocument();
        expect(within(table).queryByRole('link', { name: 'View: Ada' })).toBeNull();

        await user.click(within(table).getByRole('link', { name: 'Ada' }));
        expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit');
        expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
    });

    it('opens an item that can’t be updated in its panel, even with `"open": "edit"`', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors');
        renderApp(
            {
                resources: [
                    {
                        id: 'authors',
                        label: { singular: 'author', plural: 'authors' },
                        itemTitle: 'name',
                        open: 'edit',
                        fields: [{ name: 'name', type: 'text', label: 'Name' }],
                        actions: [{ id: 'edit', kind: 'link', scope: ['item'] }],
                    },
                ],
            },
            [],
            (backend) => {
                const [ada] = backend.items('authors');
                if (ada !== undefined) {
                    ada.abilities = { ...ada.abilities, update: false };
                }
            },
        );
        const table = await screen.findByRole('table', { name: 'Authors' });
        const title = await within(table).findByRole('link', { name: 'Ada' });
        expect(title).toHaveAttribute('href', '/panneau/resources/authors/1');
        expect(within(table).queryByRole('link', { name: 'Edit: Ada' })).toBeNull();

        await user.click(title);
        const panel = await screen.findByRole('region', { name: 'Details of the author' });
        expect(await within(panel).findByRole('heading', { name: 'Ada' })).toBeInTheDocument();
        // The item can't be updated: no redirect to its form, and no link to it
        expect(window.location.pathname).toBe('/panneau/resources/authors/1');
        expect(within(panel).queryByRole('link', { name: 'Edit' })).toBeNull();
    });

    it('goes to the route of a declared `edit` from the panel, as its rows do', async () => {
        window.history.replaceState(null, '', '/panneau/resources/pages/1');
        renderApp({
            routes: { editor: '/editor/{id}' },
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    fields: [{ name: 'title', type: 'text' }],
                    actions: [
                        { id: 'edit', kind: 'link', route: 'editor', scope: ['item'] },
                        {
                            id: 'site',
                            label: 'On the site',
                            kind: 'link',
                            url: 'https://example.com/{id}',
                            scope: ['item'],
                        },
                    ],
                },
            ],
        });
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        expect(await within(panel).findByRole('link', { name: 'Edit' })).toHaveAttribute(
            'href',
            '/editor/1',
        );
        expect(within(panel).getByRole('link', { name: 'On the site' })).toHaveAttribute(
            'target',
            '_blank',
        );
    });

    it('redirects the show route of a resource that opens items in their form', async () => {
        window.history.replaceState(null, '', '/panneau/resources/authors/1#name');
        renderApp({
            resources: [
                {
                    id: 'authors',
                    label: { singular: 'author', plural: 'authors' },
                    open: 'edit',
                    fields: [{ name: 'name', type: 'text', label: 'Name' }],
                },
            ],
        });
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit'),
        );
        expect(window.location.hash).toBe('#name');
        expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
        expect(screen.queryByRole('region', { name: 'Details of the author' })).toBeNull();
    });

    it('keeps the show route of a resource that the user can’t list', async () => {
        window.history.replaceState(null, '', '/panneau/resources/authors/1');
        renderApp({
            resources: [
                {
                    id: 'authors',
                    label: { singular: 'author', plural: 'authors' },
                    open: 'edit',
                    abilities: { viewAny: false },
                    fields: [{ name: 'name', type: 'text', label: 'Name' }],
                },
            ],
        });
        expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
        expect(window.location.pathname).toBe('/panneau/resources/authors/1');
    });

    it('shows the built-in item actions on each row by its abilities, without declaring them', async () => {
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp({}, [], (backend) => {
            const contact = backend.items('pages')[1];
            if (contact !== undefined) {
                // Contact can only be viewed
                contact.abilities = { view: true };
            }
        });
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(await within(table).findByRole('link', { name: 'Edit: About us' })).toHaveAttribute(
            'href',
            '/panneau/resources/pages/1/edit',
        );
        expect(within(table).getByRole('link', { name: 'View: About us' })).toBeInTheDocument();
        expect(within(table).getByRole('link', { name: 'View: Contact' })).toBeInTheDocument();
        expect(within(table).queryByRole('link', { name: 'Edit: Contact' })).toBeNull();
        expect(within(table).queryByRole('button', { name: 'Duplicate: Contact' })).toBeNull();
        expect(within(table).queryByRole('button', { name: 'Delete: Contact' })).toBeNull();

        // Buttons in the row while they fit (decision 0060)
        expect(
            within(table).getByRole('button', { name: 'Duplicate: About us' }),
        ).toBeInTheDocument();
        expect(within(table).getByRole('button', { name: 'Delete: About us' })).toBeInTheDocument();
    });

    it('shows the same actions of an item in its row, its panel and its form', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp(
            {
                resources: [
                    {
                        id: 'pages',
                        label: { singular: 'page', plural: 'pages' },
                        itemTitle: 'title',
                        fields: [{ name: 'title', type: 'text', label: 'Title' }],
                        actions: [
                            {
                                id: 'site',
                                label: 'On the site',
                                kind: 'link',
                                url: '/site/{id}',
                                scope: ['item'],
                            },
                        ],
                    },
                ],
            },
            [],
            (backend) => {
                const about = backend.items('pages')[0];
                if (about !== undefined) {
                    // It can't be deleted
                    about.abilities = { view: true, update: true, duplicate: true, site: true };
                }
            },
        );
        const names = (scope: HTMLElement, role: 'link' | 'button') =>
            within(scope)
                .queryAllByRole(role)
                .map((element) => element.textContent);
        // The actions of rows show their icons, with their labels as names (decision 0060)
        const rowNames = (row: HTMLElement, role: 'link' | 'button') =>
            within(row)
                .queryAllByRole(role)
                .map((element) => element.getAttribute('aria-label') ?? element.textContent);

        const table = await screen.findByRole('table', { name: 'Pages' });
        const row = within(table).getByRole('link', { name: 'About us' }).closest('tr');
        if (row === null) {
            throw new Error('No row.');
        }
        await waitFor(() =>
            expect(rowNames(row, 'link')).toEqual([
                'About us',
                'View: About us',
                'Edit: About us',
                'On the site: About us',
            ]),
        );
        expect(rowNames(row, 'button')).toEqual(['Duplicate: About us']);

        await user.click(within(row).getByRole('link', { name: 'About us' }));
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        // The panel is what `show` opens
        await waitFor(() => expect(names(panel, 'link')).toEqual(['Edit', 'On the site']));
        expect(names(panel, 'button')).toContain('Duplicate');
        expect(names(panel, 'button')).not.toContain('Delete');

        await user.click(within(panel).getByRole('link', { name: 'Edit' }));
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/pages/1/edit'),
        );
        const main = screen.getByRole('main');
        // The form is what `edit` opens
        await waitFor(() =>
            expect(within(main).getByRole('link', { name: 'View' })).toBeInTheDocument(),
        );
        expect(within(main).getByRole('link', { name: 'On the site' })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: 'Duplicate' })).toBeInTheDocument();
        expect(within(main).queryByRole('link', { name: 'Edit' })).toBeNull();
        expect(within(main).queryByRole('button', { name: 'Delete' })).toBeNull();
    });

    it('shows only the built-in item actions of `itemActions`, in its order', async () => {
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemActions: ['edit'],
                    fields: [{ name: 'title', type: 'text' }],
                },
            ],
        });
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(
            await within(table).findByRole('link', { name: 'Edit: Contact' }),
        ).toBeInTheDocument();
        expect(within(table).queryByRole('link', { name: 'View: Contact' })).toBeNull();
        expect(within(table).queryByRole('button', { name: 'Actions for Contact' })).toBeNull();
        // Without `delete`, nothing applies to a selection
        expect(within(table).queryByRole('checkbox')).toBeNull();
    });

    it('duplicates an item from its row, and opens the copy in its form', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        const backend = renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                },
            ],
        });
        const table = await screen.findByRole('table', { name: 'Pages' });
        await user.click(await within(table).findByRole('button', { name: 'Duplicate: Contact' }));
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/pages/3/edit'),
        );
        expect(await screen.findByText('“Contact” is duplicated.')).toBeInTheDocument();
        expect(await screen.findByRole('textbox', { name: /title/i })).toHaveValue('Contact');
        expect(backend.items('pages').map((page) => page.id)).toEqual(['1', '2', '3']);
    });

    it('asks before duplicating from a form with unsaved changes, and copies nothing if the user stays', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages/2/edit');
        const backend = renderApp();
        await user.type(await screen.findByRole('textbox', { name: /title/i }), '!');
        await user.click(
            await within(screen.getByRole('main')).findByRole('button', { name: 'Duplicate' }),
        );
        const dialog = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
        await user.click(within(dialog).getByRole('button', { name: 'Stay' }));
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
        expect(backend.items('pages').map((page) => page.id)).toEqual(['1', '2']);
        expect(window.location.pathname).toBe('/panneau/resources/pages/2/edit');
    });

    it('deletes an item from its row after a confirmation', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        const backend = renderApp();
        const table = await screen.findByRole('table', { name: 'Pages' });
        await user.click(await within(table).findByRole('button', { name: 'Delete: Contact' }));
        const dialog = await screen.findByRole('alertdialog');
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(backend.items('pages').map((page) => page.id)).toEqual(['1']));
        await waitFor(() => expect(within(table).queryByText('Contact')).toBeNull());
    });

    it('deletes an item from its panel, and closes the panel', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages/2');
        const backend = renderApp();
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        await user.click(await within(panel).findByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('alertdialog');
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/pages'));
        expect(backend.items('pages').map((page) => page.id)).toEqual(['1']);
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
    describe('abilities (decision 0046)', () => {
        const forbidden = () => screen.findByRole('heading', { name: 'Access denied' });

        it('shows the forbidden state on a resource the user can’t list, and its create route', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors');
            const { unmount } = renderForbidden({ viewAny: false, create: false });
            expect(await forbidden()).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
                'href',
                '/panneau',
            );
            expect(navigation().queryByRole('link', { name: 'Authors' })).toBeNull();
            unmount();

            window.history.replaceState(null, '', '/panneau/resources/authors/create');
            renderForbidden({ viewAny: true, create: false });
            expect(await forbidden()).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
        });

        it('hides the create button of a resource without `create`', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors');
            renderForbidden({ viewAny: true, create: false });
            expect(await screen.findByRole('table', { name: 'Authors' })).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: 'New author' })).toBeNull();
        });

        it('shows the forbidden state on a page the user can’t open, and the built-in home for `pages.home`', async () => {
            window.history.replaceState(null, '', '/panneau/pages/stats');
            const stats = definePlugin({
                id: 'stats',
                pages: { stats: () => <p>Stats</p>, home: () => <p>Custom home</p> },
            });
            const { unmount } = renderAppResult(
                {
                    pages: {
                        stats: { component: 'stats', label: 'Stats', abilities: { view: false } },
                        home: { component: 'home', abilities: { view: false } },
                    },
                    menus: { main: [{ type: 'page', page: 'stats' }, { type: 'resources' }] },
                },
                [stats],
            );
            expect(await forbidden()).toBeInTheDocument();
            expect(screen.queryByText('Stats')).toBeNull();
            expect(navigation().queryByRole('link', { name: 'Stats' })).toBeNull();
            unmount();

            window.history.replaceState(null, '', '/panneau');
            renderAppResult(
                { pages: { home: { component: 'home', abilities: { view: false } } } },
                [stats],
            );
            expect(screen.queryByText('Custom home')).toBeNull();
            expect(screen.getByText('Welcome, Ada.')).toBeInTheDocument();
        });

        it('sends the edit route of an item that can’t be updated to its panel', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
            renderApp({}, [], (backend) => {
                const [ada] = backend.items('authors');
                if (ada !== undefined) {
                    ada.abilities = { ...ada.abilities, update: false };
                }
            });
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors/1'),
            );
            const panel = await screen.findByRole('region', { name: 'Details of the author' });
            expect(await within(panel).findByText('Ada')).toBeInTheDocument();
        });

        it('shows the forbidden state when the API answers 403', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
            const { unmount } = renderAppResult({}, [], (backend) => {
                const [ada] = backend.items('authors');
                if (ada !== undefined) {
                    ada.abilities = { ...ada.abilities, view: false, update: false };
                }
            });
            expect(await forbidden()).toBeInTheDocument();
            unmount();

            // The panel of an item the user can't view
            window.history.replaceState(null, '', '/panneau/resources/authors/1');
            renderApp({}, [], (backend) => {
                const [ada] = backend.items('authors');
                if (ada !== undefined) {
                    ada.abilities = { ...ada.abilities, view: false };
                }
            });
            const panel = await screen.findByRole('region', { name: 'Details of the author' });
            expect(
                await within(panel).findByText('You can’t view this author.'),
            ).toBeInTheDocument();
            expect(within(panel).queryByRole('button', { name: 'Retry' })).toBeNull();
        });

        it('leaves fields the user can’t see out of the list, the panel and the form, and makes those they can’t edit read-only', async () => {
            const user = userEvent.setup();
            window.history.replaceState(null, '', '/panneau/resources/authors/1');
            renderApp({
                resources: [
                    {
                        id: 'authors',
                        label: { singular: 'author', plural: 'authors' },
                        itemTitle: 'name',
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                label: 'Name',
                                abilities: { update: false },
                            },
                            {
                                name: 'email',
                                type: 'email',
                                label: 'Email',
                                abilities: { view: false },
                            },
                            { name: 'city', type: 'text', label: 'City' },
                        ],
                    },
                ],
            });
            const table = await screen.findByRole('table', { name: 'Authors' });
            expect(within(table).queryByRole('columnheader', { name: 'Email' })).toBeNull();
            const panel = await screen.findByRole('region', { name: 'Details of the author' });
            expect(await within(panel).findByText('City')).toBeInTheDocument();
            expect(within(panel).queryByText('Email')).toBeNull();

            await user.click(within(panel).getByRole('link', { name: 'Edit' }));
            const name = await screen.findByRole('textbox', { name: 'Name' });
            expect(name).toHaveAttribute('readonly');
            expect(screen.queryByRole('textbox', { name: 'Email' })).toBeNull();
            expect(screen.getByRole('textbox', { name: 'City' })).not.toHaveAttribute('readonly');
        });
    });

    it('remembers the view of a list, unless its URL says another', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp();
        await user.click(await screen.findByRole('radio', { name: 'Cards' }));
        expect(window.location.search).toBe('?layout=cards');
        cleanup();

        // From the menu: the list opens as the user left it, and says so in its URL
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp();
        expect(await screen.findByRole('list', { name: 'Pages' })).toBeInTheDocument();
        await waitFor(() => expect(window.location.search).toBe('?layout=cards'));
        cleanup();

        // A link with a query opens what it says
        window.history.replaceState(null, '', '/panneau/resources/pages?sort=-title');
        renderApp();
        expect(await screen.findByRole('table', { name: 'Pages' })).toBeInTheDocument();
        expect(window.location.search).toBe('?sort=-title');
    });

    it('shows a calendar, which asks for the days around its month', async () => {
        const user = userEvent.setup();
        window.history.replaceState(
            null,
            '',
            '/panneau/resources/pages?layout=calendar&month=2027-03',
        );
        renderApp(
            {
                resources: [
                    {
                        id: 'pages',
                        label: { singular: 'page', plural: 'pages' },
                        fields: [
                            { name: 'title', type: 'text' },
                            { name: 'published_on', type: 'date' },
                        ],
                        list: {
                            layouts: ['table', 'calendar'],
                            filters: [{ id: 'published_on', type: 'date-range' }],
                            calendar: { field: 'published_on' },
                        },
                    },
                ],
            },
            [],
            (backend) => {
                const [about, contact] = backend.items('pages');
                Object.assign(about ?? {}, { published_on: '2027-03-10' });
                Object.assign(contact ?? {}, { published_on: '2027-05-01' });
            },
        );
        const grid = await screen.findByRole('table', { name: 'Pages, March 2027' });
        expect(await within(grid).findByRole('link', { name: 'About us' })).toBeInTheDocument();
        expect(grid).not.toHaveTextContent('Contact');
        expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
        await user.click(screen.getByRole('radio', { name: 'Table' }));
        expect(await screen.findByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('shows the images of a media library in its gallery and its table, without itemImage', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        renderApp(
            {
                resources: [
                    {
                        id: 'pages',
                        kind: 'media',
                        label: { singular: 'page', plural: 'pages' },
                        itemTitle: 'title',
                        fields: [
                            { name: 'file', type: 'file' },
                            { name: 'title', type: 'text' },
                        ],
                        list: { layouts: ['gallery', 'table'] },
                    },
                ],
            },
            [],
            (backend) => {
                const [about] = backend.items('pages');
                Object.assign(about ?? {}, {
                    media: { type: 'image', thumbnailUrl: 'https://example.com/about.jpg' },
                });
            },
        );
        const gallery = await screen.findByRole('list', { name: 'Pages' });
        expect(await within(gallery).findByRole('link', { name: 'About us' })).toBeInTheDocument();
        expect(gallery.querySelector('img')).toHaveAttribute(
            'src',
            'https://example.com/about.jpg',
        );
        await user.click(screen.getByRole('radio', { name: 'Table' }));
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(table.querySelector('img')).toHaveAttribute('src', 'https://example.com/about.jpg');
    });

    it('edits a field in place in the list, and saves it alone', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        const definition = createDefinition();
        const pages = definition.resources[0];
        const backend = renderApp({
            resources: [
                { ...pages, list: { inlineEdit: ['title'] } } as NonNullable<typeof pages>,
                ...definition.resources.slice(1),
            ],
        });
        await user.click(await screen.findByRole('button', { name: 'Edit title of About us' }));
        const input = screen.getByRole('textbox', { name: 'title' });
        await user.clear(input);
        await user.type(input, 'About{Enter}');
        await waitFor(() =>
            expect(backend.items('pages').find((item) => item.id === '1')).toMatchObject({
                title: 'About',
            }),
        );
        expect(await screen.findByRole('link', { name: 'About' })).toBeInTheDocument();
        // "Undo" in its toast saves the previous value the same way (decision 0063)
        const toast = await screen.findByRole('alertdialog');
        expect(toast).toHaveTextContent('“About”: title saved.');
        await user.click(within(toast).getByRole('button', { name: 'Undo' }));
        await waitFor(() =>
            expect(backend.items('pages').find((item) => item.id === '1')).toMatchObject({
                title: 'About us',
            }),
        );
        expect(await screen.findByText('“About us”: title put back.')).toBeInTheDocument();
    });

    it('deletes an item of a resource with a trash at once, and "Undo" puts it back', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        const definition = createDefinition();
        const pages = definition.resources[0] as NonNullable<(typeof definition.resources)[0]>;
        const backend = renderApp({
            resources: [
                {
                    ...pages,
                    actions: [
                        ...(pages.actions ?? []),
                        {
                            id: 'delete',
                            kind: 'server',
                            scope: ['item', 'selection'],
                            undoable: true,
                        },
                    ],
                } as typeof pages,
                ...definition.resources.slice(1),
            ],
        });
        const before = backend.items('pages').length;
        await user.click(await screen.findByRole('button', { name: 'Delete: About us' }));
        // No confirmation: the toast offers to undo it
        expect(screen.queryByRole('alertdialog', { name: /Delete/ })).toBeNull();
        await waitFor(() => expect(backend.items('pages')).toHaveLength(before - 1));
        const toast = await screen.findByRole('alertdialog');
        await user.click(within(toast).getByRole('button', { name: 'Undo' }));
        await waitFor(() => expect(backend.items('pages')).toHaveLength(before));
        expect(await screen.findByRole('link', { name: 'About us' })).toBeInTheDocument();
    });
});

describe('resource types (decision 0077)', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        window.localStorage.clear();
    });

    const types = [
        { id: 'home', label: 'Front page', fields: [], abilities: { create: false } },
        {
            id: 'event',
            label: 'Event',
            description: 'With a date and a place',
            fields: [{ name: 'venue', type: 'text', label: 'Venue' }],
        },
        {
            id: 'article',
            label: 'Article',
            fields: [{ name: 'summary', type: 'textarea', label: 'Summary' }],
        },
    ];

    /** The app with posts of three types: a home page, events and articles. */
    function renderTypedApp(postTypes: typeof types = types) {
        const definition = createDefinition({
            resources: [
                {
                    id: 'posts',
                    label: { singular: 'post', plural: 'posts' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    types: postTypes,
                },
                {
                    id: 'authors',
                    label: { singular: 'author', plural: 'authors' },
                    fields: [{ name: 'name', type: 'text' }],
                },
            ],
        });
        const backend = createMockBackend({
            definition,
            items: {
                posts: [
                    { id: '1', title: 'Welcome', type: 'home' },
                    { id: '2', title: 'Concert', type: 'event', venue: 'Hall' },
                ],
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
        return { backend, unmount: cleanup };
    }

    it('creates an item of the type chosen in the menu of the list, with its fields', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/posts');
        const { backend } = renderTypedApp();
        await screen.findByRole('table', { name: 'Posts' });
        await user.click(screen.getByRole('button', { name: 'New post' }));
        const menu = await screen.findByRole('menu', { name: 'New post' });
        // The home page is a singleton: it isn't offered
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['EventWith a date and a place', 'Article']);

        await user.click(within(menu).getByRole('menuitem', { name: /Event/ }));
        expect(window.location.pathname).toBe('/panneau/resources/posts/create/event');
        expect(await screen.findByRole('heading', { name: 'New Event' })).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Summary' })).toBeNull();
        await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Picnic');
        await user.type(screen.getByRole('textbox', { name: 'Venue' }), 'Park');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/posts'));
        expect(backend.items('posts').at(-1)).toMatchObject({
            title: 'Picnic',
            type: 'event',
            venue: 'Park',
        });
    });

    it('asks for the type on the create route without one', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/posts/create');
        renderTypedApp();
        expect(screen.getByRole('heading', { name: 'New post' })).toBeInTheDocument();
        expect(screen.getByText('Which type of post?')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Front page/ })).toBeNull();
        await user.click(screen.getByRole('link', { name: /Article/ }));
        expect(window.location.pathname).toBe('/panneau/resources/posts/create/article');
        expect(await screen.findByRole('textbox', { name: 'Summary' })).toBeInTheDocument();
    });

    it('goes straight to the form of the only type that can be created', async () => {
        window.history.replaceState(null, '', '/panneau/resources/posts');
        const { unmount } = renderTypedApp(types.slice(0, 2));
        await screen.findByRole('table', { name: 'Posts' });
        expect(screen.getByRole('link', { name: 'New post' })).toHaveAttribute(
            'href',
            '/panneau/resources/posts/create/event',
        );
        unmount();

        window.history.replaceState(null, '', '/panneau/resources/posts/create');
        renderTypedApp(types.slice(0, 2));
        expect(screen.getByRole('heading', { name: 'New Event' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Venue' })).toBeInTheDocument();
    });

    it('refuses a type that can’t be created, and doesn’t find one that doesn’t exist', async () => {
        window.history.replaceState(null, '', '/panneau/resources/posts/create/home');
        const { unmount } = renderTypedApp();
        expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
        unmount();

        window.history.replaceState(null, '', '/panneau/resources/posts/create/other');
        const second = renderTypedApp();
        expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
        second.unmount();

        // A resource without types has no create route per type
        window.history.replaceState(null, '', '/panneau/resources/authors/create/event');
        renderTypedApp();
        expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    });

    it('edits an item with the fields of its type, and shows them in its panel', async () => {
        window.history.replaceState(null, '', '/panneau/resources/posts/2/edit');
        const { unmount } = renderTypedApp();
        expect(await screen.findByRole('textbox', { name: 'Venue' })).toHaveValue('Hall');
        expect(screen.queryByRole('textbox', { name: 'Summary' })).toBeNull();
        unmount();

        window.history.replaceState(null, '', '/panneau/resources/posts/2');
        renderTypedApp();
        const panel = await screen.findByRole('region', { name: 'Details of the post' });
        expect(await within(panel).findByText('Venue')).toBeInTheDocument();
        expect(within(panel).getByText('Hall')).toBeInTheDocument();
    });
});

describe('the panels of a form sidebar', () => {
    it('moves the actions of the item from the header to the actions panel', async () => {
        window.history.replaceState(null, '', '/panneau/resources/pages/1/edit');
        renderApp({
            resources: [
                {
                    id: 'pages',
                    label: { singular: 'page', plural: 'pages' },
                    itemTitle: 'title',
                    fields: [{ name: 'title', type: 'text', label: 'Title' }],
                    form: {
                        layout: [
                            { type: 'field', name: 'title' },
                            { type: 'sidebar', panel: 'actions' },
                        ],
                    },
                },
            ],
        });
        await screen.findByRole('heading', { name: 'About us' });
        const sidebar = screen.getByRole('region', { name: 'Sidebar' });
        expect(
            await within(sidebar).findByRole('button', { name: 'Duplicate' }),
        ).toBeInTheDocument();
        // Only once: the header leaves them out
        expect(screen.getAllByRole('button', { name: 'Duplicate' })).toHaveLength(1);
    });
});
