import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PageProps, type PanneauPlugin, definePlugin } from '@panneau/core';
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
    options: {
        queryClient?: QueryClient;
        /** Wraps the backend's `fetch`, to hold or watch requests. */
        fetch?: (fetch: typeof window.fetch) => typeof window.fetch;
    } = {},
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
            adapter={createRestAdapter({
                baseUrl: '/panneau/api',
                fetch: options.fetch?.(backend.fetch) ?? backend.fetch,
            })}
            queryClient={
                options.queryClient ??
                new QueryClient({ defaultOptions: { queries: { retry: false } } })
            }
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

const USERS_RESOURCE = {
    id: 'users',
    label: { singular: 'user', plural: 'users' },
    fields: [{ name: 'name', type: 'text' }],
};

describe('the app shell', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
        window.localStorage.clear();
        window.sessionStorage.clear();
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

    describe('opening an item from its list (#422)', () => {
        /** Counts the requests of the list of a resource, without those of its items. */
        function countListRequests(resource: string) {
            const requests: string[] = [];
            const fetch = (inner: typeof window.fetch) =>
                (async (input, init) => {
                    const url = new URL(
                        input instanceof Request ? input.url : String(input),
                        window.location.href,
                    );
                    if (url.pathname === `/panneau/api/resources/${resource}`) {
                        requests.push(url.search);
                    }
                    return inner(input, init);
                }) satisfies typeof window.fetch;
            return { requests, fetch };
        }

        async function expectListKept(resource: string, title: string, region: string) {
            const user = userEvent.setup();
            const table = await screen.findByRole('table');
            const link = await within(table).findByRole('link', { name: title });
            const rows = within(table).getAllByRole('row');
            await user.click(link);
            const panel = await screen.findByRole('region', { name: region });
            expect(await within(panel).findAllByText(title)).not.toHaveLength(0);
            // The same table and the same rows: the list wasn't rendered again
            expect(screen.getByRole('table')).toBe(table);
            expect(within(table).getAllByRole('row')).toEqual(rows);
            await user.keyboard('{Escape}');
            expect(window.location.pathname).toBe(`/panneau/resources/${resource}`);
            expect(screen.queryByRole('region', { name: region })).toBeNull();
            expect(screen.getByRole('table')).toBe(table);
            expect(within(table).getAllByRole('row')).toEqual(rows);
        }

        it('keeps the list and its rows mounted, and doesn’t fetch it again', async () => {
            window.history.replaceState(null, '', '/panneau/resources/pages');
            const { requests, fetch } = countListRequests('pages');
            renderApp({}, [], undefined, { fetch });
            await expectListKept('pages', 'Contact', 'Details of the page');
            expect(requests).toHaveLength(1);
        });

        it('keeps the list mounted while an item that opens in its form loads, and can’t be updated', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors');
            const { requests, fetch } = countListRequests('authors');
            renderApp(
                {
                    resources: [
                        {
                            id: 'authors',
                            label: { singular: 'author', plural: 'authors' },
                            itemTitle: 'name',
                            fields: [{ name: 'name', type: 'text', label: 'Name' }],
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
                { fetch },
            );
            await expectListKept('authors', 'Ada', 'Details of the author');
            expect(requests).toHaveLength(1);
        });

        it('shows the skeletons of the list and of the panel when the item’s URL loads', async () => {
            window.history.replaceState(null, '', '/panneau/resources/authors/1');
            renderApp({
                resources: [
                    {
                        id: 'authors',
                        label: { singular: 'author', plural: 'authors' },
                        itemTitle: 'name',
                        fields: [{ name: 'name', type: 'text', label: 'Name' }],
                    },
                ],
            });
            // Before the item says whether it opens in its form: the page, not nothing
            expect(screen.getByRole('heading', { name: 'Authors', level: 1 })).toBeInTheDocument();
            const panel = screen.getByRole('region', { name: 'Details of the author' });
            expect(panel.querySelector('[aria-busy="true"]')).not.toBeNull();
            expect(
                screen.getByRole('main').querySelectorAll('[aria-busy="true"]').length,
            ).toBeGreaterThan(1);
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit'),
            );
        });
    });

    describe('going back to a list from an item’s form (#429)', () => {
        const AUTHORS = {
            id: 'authors',
            label: { singular: 'author', plural: 'authors' },
            itemTitle: 'name',
            fields: [{ name: 'name', type: 'text', label: 'Name' }],
            actions: [
                { id: 'edit', kind: 'link', scope: ['item'] },
                {
                    id: 'delete',
                    label: 'Delete',
                    scope: ['item'],
                    destructive: true,
                    confirm: true,
                },
            ],
        } satisfies DefinitionInput['resources'][number];
        // A query of the moment: a search, a sort, a layout and a page, which a bare URL drops
        const QUERY = '?q=a&sort=-name&layout=cards&page=1';

        function renderAuthors() {
            window.history.replaceState(null, '', `/panneau/resources/authors${QUERY}`);
            return renderApp({ resources: [AUTHORS] });
        }

        /** Opens the form of an item from its title in the list. */
        async function openForm(user: ReturnType<typeof userEvent.setup>, title: string) {
            const main = within(screen.getByRole('main'));
            await user.click(await main.findByRole('link', { name: title }));
            await waitFor(() =>
                expect(window.location.pathname).toMatch(
                    /^\/panneau\/resources\/authors\/\d+\/edit$/,
                ),
            );
            await screen.findByRole('textbox', { name: 'Name' });
        }

        it('goes back with the header’s link to the list as the user left it', async () => {
            const user = userEvent.setup();
            renderAuthors();
            await openForm(user, 'Ada');
            const back = within(screen.getByRole('main')).getByRole('link', { name: 'Authors' });
            expect(back).toHaveAttribute('href', `/panneau/resources/authors${QUERY}`);
            await user.click(back);
            expect(window.location.pathname).toBe('/panneau/resources/authors');
            expect(window.location.search).toBe(QUERY);
            // In its layout of the moment, the cards, rather than the table
            expect(
                await within(screen.getByRole('main')).findByRole('link', { name: 'Ada' }),
            ).toBeInTheDocument();
            expect(screen.queryByRole('table')).toBeNull();
        });

        it('goes back to the list as the user left it after a delete from the form', async () => {
            const user = userEvent.setup();
            const backend = renderAuthors();
            await openForm(user, 'Ada');
            await user.click(
                within(screen.getByRole('main')).getByRole('button', { name: 'Delete' }),
            );
            const dialog = await screen.findByRole('alertdialog');
            await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors'),
            );
            expect(window.location.search).toBe(QUERY);
            expect(backend.items('authors')).toEqual([]);
        });

        it('restores the scroll of the list on Back and Forward, and starts a new page at the top', async () => {
            const user = userEvent.setup();
            renderAuthors();
            const main = screen.getByRole('main');
            // jsdom doesn't scroll: the element keeps what it is given
            let scrollTop = 0;
            Object.defineProperty(main, 'scrollTop', {
                configurable: true,
                get: () => scrollTop,
                set: (value: number) => {
                    scrollTop = value;
                },
            });
            await within(main).findByRole('link', { name: 'Ada' });
            scrollTop = 480;

            // A new page: at the top, with the focus on its title
            await openForm(user, 'Ada');
            await waitFor(() => expect(scrollTop).toBe(0));
            await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus());
            scrollTop = 120;

            window.history.back();
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors'),
            );
            expect(window.location.search).toBe(QUERY);
            await waitFor(() => expect(scrollTop).toBe(480));
            await waitFor(() =>
                expect(screen.getByRole('heading', { level: 1, name: 'Authors' })).toHaveFocus(),
            );

            window.history.forward();
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors/1/edit'),
            );
            await waitFor(() => expect(scrollTop).toBe(120));

            // The header's link is a new navigation, even to the same list: at the top
            await user.click(
                within(screen.getByRole('main')).getByRole('link', { name: 'Authors' }),
            );
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors'),
            );
            await waitFor(() => expect(scrollTop).toBe(0));
        });

        it('still goes to the list that highlights the new item after a create (decision 0066)', async () => {
            const user = userEvent.setup();
            renderAuthors();
            const main = within(screen.getByRole('main'));
            await main.findByRole('link', { name: 'Ada' });
            await user.click(main.getByRole('link', { name: 'New author' }));
            // The new page takes the focus on its title in the next frame: typing before it would
            // lose the keys that follow, depending on when that frame comes (#457)
            await waitFor(() =>
                expect(screen.getByRole('heading', { level: 1, name: 'New author' })).toHaveFocus(),
            );
            await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Zora');
            await user.click(screen.getByRole('button', { name: 'Save' }));
            await waitFor(() =>
                expect(window.location.pathname).toBe('/panneau/resources/authors'),
            );
            // Its remembered view, not the search of the moment, which may hide the new item
            expect(window.location.search).not.toContain('q=');
            const table = await screen.findByRole('table', { name: 'Authors' });
            await waitFor(() =>
                expect(table.querySelector('[data-highlighted]')).toHaveTextContent('Zora'),
            );
        });
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

    it('marks the title of the tab while its form has unsaved changes', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
        renderApp();
        const field = await screen.findByRole('textbox', { name: /name/i });
        await waitFor(() => expect(document.title).toMatch(/^Edit the author · /));
        // Discarded: typed, then erased
        await user.type(field, '!');
        await waitFor(() => expect(document.title).toMatch(/^• Edit the author · /));
        await user.type(field, '{Backspace}');
        await waitFor(() => expect(document.title).toMatch(/^Edit the author · /));
        // Saved
        await user.type(field, ' Lovelace');
        await waitFor(() => expect(document.title).toMatch(/^• Edit the author · /));
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(document.title).toMatch(/^Edit the author · /));
    });

    describe('when the item of a form gets a new version', () => {
        /** Someone else saves the author, then the app fetches it again (focus, an action). */
        async function saveElsewhere(
            backend: ReturnType<typeof createMockBackend>,
            queryClient: QueryClient,
        ) {
            await backend.fetch('/panneau/api/resources/authors/1', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Ada King' }),
            });
            await queryClient.invalidateQueries();
        }

        it('takes it in a form without unsaved changes, which stays where it is', async () => {
            const user = userEvent.setup();
            window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
            const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
            const backend = renderApp({}, [], undefined, { queryClient });
            const field = await screen.findByRole('textbox', { name: /name/i });
            expect(field).toHaveValue('Ada');
            await user.click(field);
            await saveElsewhere(backend, queryClient);
            await waitFor(() => expect(field).toHaveValue('Ada King'));
            // The same form: the field keeps the focus
            expect(field).toHaveFocus();
            expect(screen.queryByText('A newer version of this item was saved')).toBeNull();
        });

        it('keeps unsaved changes, and offers to compare them with it', async () => {
            const user = userEvent.setup();
            window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
            const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
            const backend = renderApp({}, [], undefined, { queryClient });
            const field = await screen.findByRole('textbox', { name: /name/i });
            await user.type(field, ' Lovelace');
            await saveElsewhere(backend, queryClient);

            const notice = (
                await screen.findByText('A newer version of this item was saved')
            ).closest<HTMLElement>('[role="status"]');
            if (notice === null) {
                throw new Error('The notice is not a status');
            }
            const form = screen.getByRole('form');
            expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Ada Lovelace');
            expect(within(form).getByText('Unsaved changes')).toBeInTheDocument();

            await user.click(within(notice).getByRole('button', { name: 'Compare' }));
            const dialog = await screen.findByRole('alertdialog', {
                name: 'Someone else saved this item',
            });
            expect(dialog).toHaveTextContent('Ada Lovelace');
            expect(dialog).toHaveTextContent('Ada King');
            await user.click(
                within(dialog).getByRole('button', { name: 'Load the current version' }),
            );
            await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
            expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Ada King');
            expect(screen.queryByText('A newer version of this item was saved')).toBeNull();
        });

        it('keeps what is typed while it saves', async () => {
            const user = userEvent.setup();
            window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
            // The update waits until the test lets it through
            let release: () => void = () => undefined;
            const held = new Promise<void>((resolve) => (release = resolve));
            const backend = renderApp({}, [], undefined, {
                fetch: (fetch) => async (input, init) => {
                    if (init?.method === 'PATCH') {
                        await held;
                    }
                    return fetch(input, init);
                },
            });
            const field = await screen.findByRole('textbox', { name: /name/i });
            await user.type(field, ' Lovelace');
            await user.click(screen.getByRole('button', { name: 'Save' }));
            await user.type(screen.getByRole('textbox', { name: /name/i }), '!');
            release();

            await waitFor(() => expect(backend.items('authors')[0]?.name).toBe('Ada Lovelace'));
            const form = screen.getByRole('form');
            await waitFor(() =>
                expect(within(form).queryByRole('button', { name: /saving/i })).toBeNull(),
            );
            expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Ada Lovelace!');
            expect(within(form).getByText('Unsaved changes')).toBeInTheDocument();
            // What was saved is clean
            await user.type(screen.getByRole('textbox', { name: /name/i }), '{Backspace}');
            await waitFor(() => expect(within(form).queryByText('Unsaved changes')).toBeNull());
            expect(screen.queryByText('A newer version of this item was saved')).toBeNull();
        });
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
        // The title of an item opens its form (decision 0082)
        await user.click(await screen.findByRole('link', { name: 'Ada' }));
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
        // Back on the list the form was opened from
        await waitFor(() => expect(window.location.pathname).toBe('/panneau/resources/authors'));
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
        renderApp({ resources: [...createDefinition().resources, USERS_RESOURCE] });
        const account = within(screen.getByRole('complementary')).getByRole('button', {
            name: 'Your account (Ada)',
        });
        await user.click(account);
        await user.click(
            within(await screen.findByRole('menu')).getByRole('menuitem', { name: 'Profile' }),
        );
        await waitFor(() =>
            expect(window.location.pathname).toBe('/panneau/resources/users/usr_1/edit'),
        );
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        // The button of the menu shows that the profile is the current page
        expect(account).toHaveAttribute('data-current', 'true');
    });

    describe("the user's menu (decision 0086)", () => {
        const sidebar = () => within(screen.getByRole('complementary'));

        it('opens from the keyboard, with the user, their profile, the appearance and "Log out"', async () => {
            const user = userEvent.setup();
            renderApp({
                resources: [...createDefinition().resources, USERS_RESOURCE],
                user: { id: 'usr_1', name: 'Ada Lovelace', email: 'ada.lovelace@example.com' },
                auth: { mode: 'external', loginUrl: '/login', logoutUrl: '/logout' },
            });
            const account = sidebar().getByRole('button', {
                name: 'Your account (Ada Lovelace)',
            });
            // Only one button in the footer: no buttons of the appearance or the language
            expect(sidebar().queryByRole('button', { name: /Appearance/ })).toBeNull();
            expect(sidebar().queryByRole('button', { name: 'Log out' })).toBeNull();
            expect(account).toHaveAttribute('aria-haspopup', 'true');
            expect(account).toHaveAttribute('aria-expanded', 'false');

            account.focus();
            await user.keyboard('{Enter}');
            const menu = await screen.findByRole('menu', { name: 'Your account (Ada Lovelace)' });
            expect(account).toHaveAttribute('aria-expanded', 'true');
            // The first item has the focus
            await waitFor(() =>
                expect(within(menu).getByRole('menuitem', { name: 'Profile' })).toHaveFocus(),
            );
            // Who is logged in, with the whole email, labels the profile's group
            expect(
                within(menu).getByRole('group', {
                    name: 'Ada Lovelace ada.lovelace@example.com',
                }),
            ).toContainElement(within(menu).getByRole('menuitem', { name: 'Profile' }));
            const appearance = within(within(menu).getByRole('group', { name: 'Appearance' }));
            expect(
                appearance
                    .getAllByRole('menuitemradio')
                    .map((item) => [item.textContent, item.getAttribute('aria-checked')]),
            ).toEqual([
                ['Light', 'true'],
                ['Dark', 'false'],
                ['Same as the system', 'false'],
            ]);
            expect(within(menu).getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();

            await user.keyboard('{ArrowDown}{ArrowDown}');
            expect(appearance.getByRole('menuitemradio', { name: 'Dark' })).toHaveFocus();
            await user.keyboard('{Enter}');
            expect(window.localStorage.getItem('panneau:color-scheme')).toBe('dark');
            // The menu closes, and gives the focus back to its button
            await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
            await waitFor(() => expect(account).toHaveFocus());

            await user.keyboard('{Enter}');
            const reopened = await screen.findByRole('menu');
            expect(within(reopened).getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
                'aria-checked',
                'true',
            );
            await user.keyboard('{Escape}');
            await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
            await waitFor(() => expect(account).toHaveFocus());
        });

        it('has no profile without the resource of users', async () => {
            const user = userEvent.setup();
            renderApp();
            await user.click(sidebar().getByRole('button', { name: 'Your account (Ada)' }));
            const menu = await screen.findByRole('menu');
            expect(within(menu).queryByRole('menuitem', { name: 'Profile' })).toBeNull();
            expect(within(menu).getByRole('group', { name: 'Appearance' })).toBeInTheDocument();
        });

        it('opens the same menu from the avatar of the rail', async () => {
            const user = userEvent.setup();
            renderApp();
            await user.click(screen.getByRole('button', { name: 'Collapse the sidebar' }));
            const account = sidebar().getByRole('button', { name: 'Your account (Ada)' });
            await user.click(account);
            const menu = await screen.findByRole('menu', { name: 'Your account (Ada)' });
            expect(within(menu).getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
                'aria-checked',
                'true',
            );
        });
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
            await user.click(screen.getByRole('button', { name: 'Your account (Ada)' }));
            // The same menu as the sidebar's, named after its button
            const menu = await screen.findByRole('menu', { name: 'Your account (Ada)' });
            expect(within(menu).getByRole('group', { name: 'Ada' })).toBeInTheDocument();
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
        function JobPage({ params, title = '' }: PageProps & { title?: string }) {
            return <h1>{`${title} ${params.id ?? ''}`}</h1>;
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

    it('opens a dashboard page from a menu, with its own widgets (decision 0084)', async () => {
        const user = userEvent.setup();
        renderApp({
            pages: {
                home: { component: 'dashboard' },
                activity: {
                    component: 'dashboard',
                    label: 'Activity',
                    widgets: [
                        {
                            id: 'pages-count',
                            type: 'stat',
                            label: 'All pages',
                            settings: { resource: 'pages' },
                        },
                    ],
                },
            },
            menus: { main: [{ type: 'resources' }, { type: 'page', page: 'activity' }] },
        });
        // The home page without widgets keeps the cards of the resources
        expect(await screen.findByText('Welcome, Ada.')).toBeInTheDocument();

        await user.click(navigation().getByRole('link', { name: 'Activity' }));
        expect(window.location.pathname).toBe('/panneau/pages/activity');
        expect(
            await screen.findByRole('heading', { level: 1, name: 'Activity' }),
        ).toBeInTheDocument();
        expect(screen.queryByText('Welcome, Ada.')).toBeNull();
        await waitFor(() => expect(document.title).toBe('Activity · Test site'));
        expect(await screen.findByRole('link', { name: 'All pages 2' })).toHaveAttribute(
            'href',
            '/panneau/resources/pages',
        );
        expect(navigation().getByRole('link', { name: 'Activity' })).toHaveAttribute(
            'aria-current',
            'page',
        );
    });

    it('shows the parents of a page above its title: a link to one, breadcrumbs from two (decision 0093)', async () => {
        const definition = createDefinition();
        // The authors are under the dashboard page "Activity", and out of the menus
        const resources = definition.resources.map((resource) =>
            resource.id === 'authors'
                ? { ...resource, itemTitle: 'name', parent: 'activity' }
                : resource,
        );
        renderApp({
            resources,
            pages: { activity: { component: 'dashboard', label: 'Activity' } },
            menus: {
                main: [
                    { type: 'resource', resource: 'pages' },
                    { type: 'page', page: 'activity' },
                ],
            },
        });
        const user = userEvent.setup();

        // The list of the authors: one parent, the dashboard page, current in the menus
        await user.click(screen.getByRole('link', { name: /Authors/ }));
        const main = () => within(screen.getByRole('main'));
        await waitFor(() =>
            expect(main().getByRole('heading', { level: 1, name: 'Authors' })).toBeInTheDocument(),
        );
        expect(main().getByRole('link', { name: 'Activity' })).toHaveAttribute(
            'href',
            '/panneau/pages/activity',
        );
        expect(main().queryByRole('navigation', { name: 'Breadcrumbs' })).toBeNull();
        expect(navigation().getByRole('link', { name: 'Activity' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        await waitFor(() => expect(document.title).toBe('Authors · Activity · Test site'));

        // An author: two parents, as breadcrumbs, and a link to the nearest one on narrow roots
        await user.click(await main().findByRole('link', { name: 'Ada' }));
        await waitFor(() =>
            expect(main().getByRole('heading', { level: 1, name: 'Ada' })).toBeInTheDocument(),
        );
        const crumbs = main().getByRole('navigation', { name: 'Breadcrumbs' });
        expect(
            within(crumbs)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Activity', 'Authors', 'Ada']);
        expect(within(crumbs).getByText('Ada').closest('[aria-current]')).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(
            main()
                .getAllByRole('link', { name: 'Authors' })
                .map((link) => link.getAttribute('href')),
        ).toEqual(['/panneau/resources/authors', '/panneau/resources/authors']);
        expect(navigation().getByRole('link', { name: 'Activity' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        await waitFor(() => expect(document.title).toBe('Ada · Authors · Activity · Test site'));
    });

    it('shows a skeleton for the title of an item and its crumb while it loads (decision 0093)', async () => {
        const definition = createDefinition();
        const resources = definition.resources.map((resource) =>
            resource.id === 'authors'
                ? { ...resource, itemTitle: 'name', parent: 'activity' }
                : resource,
        );
        window.history.replaceState(null, '', '/panneau/resources/authors/1/edit');
        // The item answers once released
        const resolvers: { release?: () => void } = {};
        const held = new Promise<undefined>((resolve) => {
            resolvers.release = () => resolve(undefined);
        });
        renderApp(
            { resources, pages: { activity: { component: 'dashboard', label: 'Activity' } } },
            [],
            (backend) => {
                const fetch = backend.fetch;
                backend.fetch = async (input, init) => {
                    if (String(input).endsWith('/resources/authors/1')) {
                        await held;
                    }
                    return fetch(input, init);
                };
            },
        );
        const main = within(screen.getByRole('main'));
        const crumbs = main.getByRole('navigation', { name: 'Breadcrumbs' });
        expect(main.getByRole('heading', { level: 1 })).toHaveTextContent('Loading…');
        expect(within(crumbs).getByText('Loading…').closest('[aria-current]')).toHaveAttribute(
            'aria-current',
            'page',
        );
        resolvers.release?.();
        await waitFor(() =>
            expect(main.getByRole('heading', { level: 1, name: 'Ada' })).toBeInTheDocument(),
        );
        expect(within(crumbs).getByText('Ada')).toBeInTheDocument();
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

        // Last in the header, after the link the resource declares, outlined (decision 0088)
        const remove = main.getByRole('button', { name: 'Delete' });
        expect(
            main.getByRole('link', { name: 'View on the site' }).compareDocumentPosition(remove),
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(remove.className).toMatch(/outline/);
        expect(remove.className).not.toMatch(/solid/);
        await user.click(remove);
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
                    open: 'panel',
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

    it('opens the items of a resource in their form by default (decision 0082)', async () => {
        const user = userEvent.setup();
        const authors = {
            id: 'authors',
            label: { singular: 'author', plural: 'authors' },
            itemTitle: 'name',
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

    it('opens an item that can’t be updated in its panel, even when items open in their form', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/authors');
        renderApp(
            {
                resources: [
                    {
                        id: 'authors',
                        label: { singular: 'author', plural: 'authors' },
                        itemTitle: 'name',
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
                    open: 'panel',
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
                        open: 'panel',
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
                    ada.abilities = { ...ada.abilities, view: false, update: false };
                }
            });
            // It can't be updated: no redirect, and the error of its panel doesn't hide the page
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
                        open: 'panel',
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

    it('asks for the fields of the columns of a list only, and for whole items in the panel', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        let fetch: ReturnType<typeof vi.fn> | null = null;
        renderApp(
            {
                resources: [
                    {
                        id: 'pages',
                        label: { singular: 'page', plural: 'pages' },
                        open: 'panel',
                        itemTitle: 'title',
                        fields: [
                            { name: 'title', type: 'text', label: 'Title' },
                            { name: 'status', type: 'text', label: 'Status' },
                            { name: 'body', type: 'textarea', label: 'Body' },
                        ],
                        list: {
                            columns: [
                                { field: 'title' },
                                { field: 'status' },
                                { field: 'body', hidden: true },
                            ],
                        },
                    },
                ],
            },
            [],
            (backend) => {
                const [about] = backend.items('pages');
                Object.assign(about ?? {}, { status: 'draft', body: 'Who we are.' });
                fetch = vi.spyOn(backend, 'fetch') as unknown as ReturnType<typeof vi.fn>;
            },
        );
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(await within(table).findByText('draft')).toBeInTheDocument();
        const urls = () =>
            (fetch?.mock.calls ?? []).map(([input]) => new URL(String(input), 'http://test'));
        const lists = urls().filter((url) => url.pathname === '/panneau/api/resources/pages');
        expect(lists.length).toBeGreaterThan(0);
        // Sorted by name, so that moving a column asks for nothing
        expect(lists.map((url) => url.searchParams.get('fields'))).toEqual(
            lists.map(() => 'status,title'),
        );

        await user.click(within(table).getByRole('link', { name: 'About us' }));
        const panel = await screen.findByRole('region', { name: 'Details of the page' });
        expect(await within(panel).findByText('Who we are.')).toBeInTheDocument();
        const item = urls().find((url) => url.pathname === '/panneau/api/resources/pages/1');
        expect(item?.searchParams.has('fields')).toBe(false);
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

    it('searches the related resource in a relation filter of a list, and applies it (#292)', async () => {
        const user = userEvent.setup();
        window.history.replaceState(null, '', '/panneau/resources/pages');
        let fetch: ReturnType<typeof vi.fn> | undefined;
        renderApp(
            {
                resources: [
                    {
                        id: 'pages',
                        label: { singular: 'page', plural: 'pages' },
                        fields: [
                            { name: 'title', type: 'text' },
                            { name: 'author', type: 'relation', resource: 'authors' },
                        ],
                        list: {
                            filters: [
                                {
                                    id: 'author',
                                    type: 'relation',
                                    resource: 'authors',
                                    label: 'Author',
                                },
                            ],
                        },
                    },
                    {
                        id: 'authors',
                        label: { singular: 'author', plural: 'authors' },
                        itemTitle: 'name',
                        features: { search: true },
                        fields: [{ name: 'name', type: 'text' }],
                    },
                ],
            },
            [],
            (backend) => {
                const [about] = backend.items('pages');
                Object.assign(about ?? {}, { author: '1' });
                fetch = vi.spyOn(backend, 'fetch') as unknown as ReturnType<typeof vi.fn>;
            },
        );
        const table = await screen.findByRole('table', { name: 'Pages' });
        expect(await within(table).findByText('Contact')).toBeInTheDocument();
        // The picker searches the related resource, once the user pauses
        const searches = () =>
            (fetch?.mock.calls ?? [])
                .map(([input]) => new URL(String(input), 'http://test'))
                .filter((url) => url.pathname === '/panneau/api/resources/authors')
                .map((url) => url.searchParams.get('q'));
        await user.type(await screen.findByRole('combobox', { name: 'Author' }), 'Ad');
        await waitFor(() => expect(searches()).toContain('Ad'));
        await user.click(await screen.findByRole('option', { name: 'Ada' }));
        await waitFor(() => expect(window.location.search).toBe('?filter%5Bauthor%5D=1'));
        await waitFor(() => expect(within(table).queryByText('Contact')).toBeNull());
        expect(within(table).getByText('About us')).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Author: Ada',
        );
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
                    open: 'panel',
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
