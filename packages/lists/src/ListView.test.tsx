import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Archive } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, createList, createMemoryRouter, definePlugin } from '@panneau/core';
import { fr } from '@panneau/intl';
import type { Field } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

import { List } from './List';
import { ListView } from './ListView';
import {
    columns,
    edit,
    editLink,
    exportAction,
    manyPages,
    pages,
    publish,
    remove,
    showLink,
    statusField,
} from './__fixtures__/pages';
import { renderList } from './__fixtures__/render';
import type { DisplayProps, ListColumn, ListInlineEditHandler, ListItem } from './types';

function rowTitles() {
    return screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '');
}

describe('List', () => {
    it('renders items in a table, with displays', () => {
        renderList(<List columns={columns} items={pages} />);
        const table = screen.getByRole('table', { name: 'Items' });
        expect(
            within(table)
                .getAllByRole('columnheader')
                .map((header) => header.textContent),
        ).toEqual(['Title', 'Status', 'Published on']);
        const first = within(table).getAllByRole('row')[1];
        expect(first).toBeDefined();
        expect(first).toHaveTextContent('About us');
        expect(first).toHaveTextContent('Published');
        expect(first?.querySelector('time')).toHaveAttribute('dateTime', '2026-03-02');
    });

    it('sorts from the column headers: ascending, descending, then back to the default', async () => {
        const user = userEvent.setup();
        renderList(<List columns={columns} items={pages} />);
        const header = screen.getByRole('columnheader', { name: /Title/ });
        expect(header).toHaveAttribute('aria-sort', 'none');
        await user.click(within(header).getByRole('button'));
        expect(header).toHaveAttribute('aria-sort', 'ascending');
        expect(rowTitles()).toEqual(['TitleAbout us', 'TitleBlog', 'TitleContact']);
        await user.click(within(header).getByRole('button'));
        expect(header).toHaveAttribute('aria-sort', 'descending');
        expect(rowTitles()[0]).toContain('Contact');
        await user.click(within(header).getByRole('button'));
        expect(header).toHaveAttribute('aria-sort', 'none');
    });

    it('searches once the user stops typing, and shows the search as a chip', async () => {
        const user = userEvent.setup();
        renderList(<List columns={columns} items={pages} search />);
        await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'blog');
        await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(2));
        const chips = screen.getByRole('list', { name: 'Active filters' });
        await user.click(
            within(chips).getByRole('button', { name: 'Remove the filter Search: blog' }),
        );
        expect(screen.getAllByRole('row')).toHaveLength(4);
        expect(screen.getByRole('searchbox')).toHaveValue('');
    });

    it('filters with a select, using the options of the field, and removes it from its chip', async () => {
        const user = userEvent.setup();
        renderList(
            <List columns={columns} items={pages} filters={[{ id: 'status', type: 'select' }]} />,
        );
        await user.click(screen.getByRole('button', { name: /Status/ }));
        await user.click(await screen.findByRole('option', { name: 'Draft' }));
        expect(screen.getAllByRole('row')).toHaveLength(3);
        const chips = screen.getByRole('list', { name: 'Active filters' });
        expect(chips).toHaveTextContent('Status: Draft');
        await user.click(screen.getByRole('button', { name: 'Remove the filter Status: Draft' }));
        expect(screen.getAllByRole('row')).toHaveLength(4);
        expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument();
    });

    it('filters with a toggle', async () => {
        const user = userEvent.setup();
        const items = [
            { id: '1', title: 'One', featured: true },
            { id: '2', title: 'Two', featured: false },
        ];
        renderList(
            <List
                columns={[{ id: 'title', label: 'Title' }]}
                items={items}
                filters={[{ id: 'featured', type: 'toggle', label: 'Featured' }]}
            />,
        );
        await user.click(screen.getByRole('switch', { name: 'Featured' }));
        expect(screen.getAllByRole('row')).toHaveLength(2);
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent('Featured');
    });

    it('says when nothing matches, and clears the filters', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { status: 'archived' } } });
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={[]}
                filters={[{ id: 'status', type: 'select' }]}
                fields={[statusField]}
            />,
        );
        expect(screen.getByText('No items match the search or the filters.')).toBeInTheDocument();
        await user.click(screen.getAllByRole('button', { name: 'Clear all' })[0] as HTMLElement);
        expect(list.getState().query.filter).toBeUndefined();
    });

    it('paginates, with the range and the page size', async () => {
        const user = userEvent.setup();
        renderList(<List columns={columns} items={manyPages(45)} perPageOptions={[10, 50]} />);
        const pagination = screen.getByRole('navigation', { name: 'Pagination' });
        expect(pagination).toHaveTextContent('1–20 of 45');
        expect(within(pagination).getByRole('button', { name: 'Previous page' })).toBeDisabled();
        await user.click(within(pagination).getByRole('button', { name: 'Next page' }));
        await user.click(within(pagination).getByRole('button', { name: 'Next page' }));
        expect(pagination).toHaveTextContent('41–45 of 45');
        expect(pagination).toHaveTextContent('Page 3 of 3');
        expect(within(pagination).getByRole('button', { name: 'Next page' })).toBeDisabled();
        await user.click(within(pagination).getByRole('button', { name: /Per page/ }));
        await user.click(await screen.findByRole('option', { name: '50' }));
        expect(pagination).toHaveTextContent('1–45 of 45');
    });

    it('shows cards, with a sort select', async () => {
        const user = userEvent.setup();
        renderList(<List columns={columns} items={pages} layouts={['table', 'cards']} />);
        await user.click(screen.getByRole('radio', { name: 'Cards' }));
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        const cards = screen.getByRole('list', { name: 'Items' });
        expect(within(cards).getAllByRole('listitem')).toHaveLength(3);
        expect(within(cards).getAllByRole('listitem')[0]).toHaveTextContent('StatusPublished');
        await user.click(screen.getByRole('button', { name: /Sort by/ }));
        await user.click(await screen.findByRole('option', { name: 'Title, descending' }));
        expect(within(cards).getAllByRole('listitem')[0]).toHaveTextContent('Contact');
    });

    it('uses the displays of plugins and of props', () => {
        const Upper = ({ value }: DisplayProps) => <strong>{String(value).toUpperCase()}</strong>;
        renderList(
            <PanneauProvider plugins={[definePlugin({ id: 'test', displays: { status: Upper } })]}>
                <List
                    columns={[
                        { id: 'status', display: 'status' },
                        { id: 'id', label: 'Id', render: (item) => `#${item.id}` },
                    ]}
                    items={pages.slice(0, 1)}
                />
            </PanneauProvider>,
        );
        expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('keeps the query in the router of the provider', async () => {
        const user = userEvent.setup();
        const router = createMemoryRouter('page=2');
        renderList(
            <PanneauProvider router={router}>
                <List columns={columns} items={manyPages(30)} />
            </PanneauProvider>,
        );
        expect(screen.getByRole('navigation')).toHaveTextContent('21–30 of 30');
        await user.click(screen.getByRole('button', { name: 'Previous page' }));
        expect(router.getSearch()).toBe('');
    });

    it('translates its messages', () => {
        renderList(<List columns={columns} items={manyPages(30)} search />, {
            locale: 'fr',
            messages: fr,
        });
        expect(screen.getByRole('searchbox', { name: 'Rechercher' })).toBeInTheDocument();
        expect(screen.getByRole('navigation')).toHaveTextContent('1–20 sur 30');
    });
});

describe('ListView', () => {
    it('draws skeleton rows of its columns while the first page loads', () => {
        const { container } = renderList(
            <ListView
                list={createList({ defaults: { perPage: 4 } })}
                columns={columns}
                items={undefined}
            />,
        );
        expect(screen.getByRole('status')).toHaveTextContent('Loading the items…');
        expect(screen.queryByRole('progressbar')).toBeNull();
        const region = container.querySelector('[aria-busy="true"]');
        expect(region?.querySelector('[inert]')).not.toBeNull();
        expect(
            [...(region?.querySelectorAll('th') ?? [])].map((header) => header.textContent),
        ).toEqual(['Title', 'Status', 'Published on']);
        expect(region?.querySelectorAll('tbody tr')).toHaveLength(4);
        expect(region?.querySelectorAll('td .panneau-skeleton')).toHaveLength(4 * columns.length);
    });

    it('draws at most the rows that fit, in the layout of the list', () => {
        const { container } = renderList(
            <ListView
                list={createList({ defaults: { perPage: 100 } })}
                columns={columns}
                items={undefined}
                layout="cards"
            />,
        );
        expect(container.querySelectorAll('[aria-busy="true"] li')).toHaveLength(10);
    });

    it('shows an error with a retry when the first page fails', async () => {
        const user = userEvent.setup();
        const onRetry = vi.fn();
        const list = createList();
        const { rerender } = renderList(
            <ListView list={list} columns={columns} items={undefined} />,
        );
        expect(screen.getByRole('status')).toBeInTheDocument();
        rerender(
            <PanneauRoot>
                <ListView
                    list={list}
                    columns={columns}
                    items={undefined}
                    error={new Error('Network down')}
                    onRetry={onRetry}
                />
            </PanneauRoot>,
        );
        expect(screen.getByText('The items could not be loaded.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Try again' }));
        expect(onRetry).toHaveBeenCalled();
    });

    it('shows its empty message', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={[]}
                emptyMessage="No pages yet."
            />,
        );
        expect(screen.getByText('No pages yet.')).toBeInTheDocument();
    });

    it('selects items, the page, then every matching item, and runs a selection action', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { status: 'draft' } } });
        const onAction = vi.fn();
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={pages.slice(1)}
                total={40}
                actions={[publish]}
                onAction={onAction}
            />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select Contact' }));
        expect(screen.getByText('1 item selected')).toBeInTheDocument();
        await user.click(screen.getByRole('checkbox', { name: 'Select every item of the page' }));
        expect(screen.getByText('2 items selected')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Select all 40 items' }));
        expect(screen.getByText('All 40 items are selected, on every page.')).toBeInTheDocument();
        await user.click(screen.getByRole('checkbox', { name: 'Select Blog' }));
        expect(screen.getByText('All 39 items are selected, on every page.')).toBeInTheDocument();

        const bar = screen.getByText(/selected, on every page/).parentElement as HTMLElement;
        await user.click(within(bar).getByRole('button', { name: 'Publish' }));
        const dialog = await screen.findByRole('alertdialog', { name: 'Publish?' });
        expect(dialog).toHaveTextContent('Publish 39 pages?');
        await user.click(within(dialog).getByRole('button', { name: 'Publish' }));
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({
                scope: 'selection',
                count: 39,
                selection: { query: { filter: { status: 'draft' } }, except: ['3'] },
            }),
        );
        await waitFor(() => expect(screen.queryByText(/selected/)).not.toBeInTheDocument());
    });

    it('asks the backend how many matching items an action will skip (a dry run)', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { status: 'draft' } } });
        const onAction = vi.fn();
        let answer: (preview: { skipped: number }) => void = () => undefined;
        const previewAction = vi.fn(
            () =>
                new Promise<{ skipped: number }>((resolve) => {
                    answer = resolve;
                }),
        );
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={pages.slice(1)}
                total={40}
                actions={[{ ...publish, dryRun: true }]}
                onAction={onAction}
                previewAction={previewAction}
            />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select every item of the page' }));
        await user.click(screen.getByRole('button', { name: 'Select all 40 items' }));
        const bar = screen.getByText(/selected, on every page/).parentElement as HTMLElement;
        await user.click(within(bar).getByRole('button', { name: 'Publish' }));
        expect(previewAction).toHaveBeenCalledWith(
            expect.objectContaining({ selection: { query: { filter: { status: 'draft' } } } }),
        );
        const dialog = await screen.findByRole('alertdialog', { name: 'Publish?' });
        expect(dialog).toHaveTextContent('Checking which items allow it…');
        expect(within(dialog).getByRole('button', { name: 'Publish' })).toBeDisabled();
        act(() => answer({ skipped: 12 }));
        await waitFor(() =>
            expect(dialog).toHaveTextContent(
                '12 selected items don’t allow it and will be skipped.',
            ),
        );
        await user.click(within(dialog).getByRole('button', { name: 'Publish' }));
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ count: 40 }));
    });

    it('runs at once when the dry run skips nothing and the action asks no confirmation', async () => {
        const user = userEvent.setup();
        const list = createList();
        const onAction = vi.fn();
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={pages}
                total={40}
                actions={[{ ...publish, confirm: undefined, dryRun: true }]}
                onAction={onAction}
                previewAction={() => Promise.resolve({ skipped: 0 })}
            />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select every item of the page' }));
        await user.click(screen.getByRole('button', { name: 'Select all 40 items' }));
        const bar = screen.getByText(/selected, on every page/).parentElement as HTMLElement;
        await user.click(within(bar).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('runs an undoable action at once, and confirms it above the limit of the undo', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.resolve());
        const undoable = { ...remove, confirm: undefined, undoable: true, dryRun: true };
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                total={101}
                actions={[undoable]}
                onAction={onAction}
                previewAction={() => Promise.resolve({ skipped: 0 })}
            />,
        );
        // One item: at once, "Undo" in its toast replaces the confirmation
        await user.click(screen.getByRole('button', { name: 'Delete: Contact' }));
        await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        // Every matching item, more than an undo puts back: the confirmation comes back
        await user.click(screen.getByRole('checkbox', { name: 'Select every item of the page' }));
        await user.click(screen.getByRole('button', { name: 'Select all 101 items' }));
        const bar = screen.getByText(/selected, on every page/).parentElement as HTMLElement;
        await user.click(within(bar).getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(onAction).toHaveBeenCalledTimes(1);
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        expect(onAction).toHaveBeenLastCalledWith(expect.objectContaining({ count: 101 }));
    });

    it('keeps the selection when the action handler gives false', async () => {
        const user = userEvent.setup();
        const list = createList();
        const onAction = vi.fn(() => Promise.resolve(false));
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={pages}
                actions={[{ ...remove, placement: ['toolbar'] }]}
                onAction={onAction}
            />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select Contact' }));
        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(onAction).toHaveBeenCalled());
        await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
        expect(list.getState().selection).toEqual({ mode: 'ids', ids: ['2'] });
    });

    it('says how many selected items an action skips', async () => {
        const user = userEvent.setup();
        renderList(
            <ListView list={createList()} columns={columns} items={pages} actions={[publish]} />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select every item of the page' }));
        const bar = screen.getByText('3 items selected').parentElement as HTMLElement;
        await user.click(within(bar).getByRole('button', { name: 'Publish' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('1 selected item doesn’t allow it and will be skipped.');
        await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows row actions that the item allows, and links', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.resolve());
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[publish, edit, remove]}
                onAction={onAction}
                selectable={false}
            />,
        );
        // About us doesn't allow publish; every page allows edit.
        expect(screen.queryByRole('button', { name: 'Publish: About us' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Edit: About us' })).toHaveAttribute(
            'href',
            '/pages/1/edit',
        );
        // Blog can't be deleted: no menu without actions.
        expect(screen.queryByRole('button', { name: 'Actions for Blog' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete: Blog' })).not.toBeInTheDocument();

        // Actions placed in the menu are buttons too while they fit (decision 0060)
        expect(screen.queryByRole('button', { name: 'Actions for Contact' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Delete: Contact' }));
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({ scope: 'item', count: 1, item: pages[1] }),
        );
    });

    it('confirms `delete` from the button of its row', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.resolve());
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[{ ...remove, confirm: { message: 'Delete this page?' } }]}
                onAction={onAction}
                selectable={false}
            />,
        );
        await user.click(screen.getByRole('button', { name: 'Delete: Contact' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('Delete this page?');
        expect(onAction).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({ scope: 'item', item: pages[1] }),
        );
    });

    it('resolves the built-in links with getLinkHref, and hides `edit` where the item can’t be updated', () => {
        const items = pages.map((item, index) =>
            index === 2 ? { ...item, abilities: { ...item.abilities, update: false } } : item,
        );
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={items}
                actions={[showLink, editLink]}
                getLinkHref={(action, item) => `/${action.id}/${item.id}`}
                selectable={false}
            />,
        );
        const link = screen.getByRole('link', { name: 'Edit: About us' });
        expect(link).toHaveAttribute('href', '/edit/1');
        // An icon: `show` is the main action, with its label (decision 0060)
        expect(link).toHaveTextContent('');
        expect(screen.getByRole('link', { name: 'View: About us' })).toHaveTextContent('View');
        expect(screen.getByRole('link', { name: 'View: Contact' })).toHaveAttribute(
            'href',
            '/show/2',
        );
        // Blog can't be updated
        expect(screen.queryByRole('link', { name: 'Edit: Blog' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View: Blog' })).toBeInTheDocument();
    });

    it('opens the row links that leave the admin in a new tab', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[showLink, editLink]}
                getLinkHref={(action, item) =>
                    action.id === 'show'
                        ? `https://example.com/pages/${item.id}`
                        : `/edit/${item.id}`
                }
                selectable={false}
            />,
        );
        const view = screen.getByRole('link', { name: 'View: About us' });
        expect(view).toHaveAttribute('target', '_blank');
        expect(view).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.getByRole('link', { name: 'Edit: About us' })).not.toHaveAttribute('target');
    });

    it('leaves out the built-in links that nothing resolves', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[editLink, { ...showLink, placement: ['menu'] }]}
                getLinkHref={(action, item) => (action.id === 'edit' ? `/edit/${item.id}` : null)}
                selectable={false}
            />,
        );
        expect(screen.getByRole('link', { name: 'Edit: About us' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Actions for About us' })).toBeNull();
    });

    it('labels the built-in links in the locale of the list', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[editLink]}
                getLinkHref={(_action, item) => `/edit/${item.id}`}
                selectable={false}
            />,
            { locale: 'fr', messages: fr },
        );
        expect(screen.getByRole('link', { name: 'Modifier : À propos' })).toHaveTextContent(
            'Modifier',
        );
    });

    it('confirms a row action, and shows a toast when it fails', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.reject(new Error('The title is missing.')));
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[publish]}
                onAction={onAction}
            />,
        );
        await user.click(screen.getByRole('button', { name: 'Publish: Contact' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('Publish 1 page?');
        await user.click(within(dialog).getByRole('button', { name: 'Publish' }));
        expect(await screen.findByText('“Publish” failed.')).toBeInTheDocument();
        expect(screen.getByText('The title is missing.')).toBeInTheDocument();
    });

    it('runs resource actions from the toolbar', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn();
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                total={3}
                actions={[exportAction]}
                onAction={onAction}
            />,
        );
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Export' }));
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({ scope: 'resource', count: 3 }),
        );
    });

    it('shows the icons that actions name, and those given by action id', async () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                total={3}
                actions={[{ ...exportAction, icon: 'file-down' }, remove]}
                actionIcons={{ delete: Archive }}
            />,
        );
        // The icon is a chunk of its own, and loading Lucide's list of icons can take more than a
        // second on a busy CI runner.
        await waitFor(
            () =>
                expect(
                    screen.getByRole('button', { name: 'Export' }).querySelector('svg'),
                ).toHaveClass('lucide-file-down'),
            { timeout: 5000 },
        );
        expect(
            screen.getByRole('button', { name: 'Delete: Contact' }).querySelector('svg'),
        ).toHaveClass('lucide-archive');
    });

    it('hides the actions the user can’t run', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                actions={[{ ...publish, abilities: { run: false } }]}
            />,
        );
        expect(screen.queryByRole('button', { name: 'Publish: Contact' })).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('links the title of items', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={(item) => `/pages/${item.id}`}
            />,
        );
        expect(screen.getByRole('link', { name: 'About us' })).toHaveAttribute('href', '/pages/1');
    });
});

describe('ListView toolbar', () => {
    it('shows an action placed in the toolbar and the menu once', async () => {
        const user = userEvent.setup();
        renderList(
            <ListView list={createList()} columns={columns} items={pages} actions={[remove]} />,
        );
        await user.click(screen.getByRole('checkbox', { name: 'Select Contact' }));
        expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
    });
});

describe('ListView layouts', () => {
    it('shows resource actions without search, filters, sorting or layouts', () => {
        renderList(
            <ListView
                list={createList()}
                columns={[{ id: 'status', label: 'Status' }]}
                items={pages}
                actions={[exportAction]}
            />,
        );
        expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('leaves out layouts without a component', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                layouts={['calendar', 'cards']}
            />,
        );
        expect(screen.queryByRole('radiogroup', { name: 'Layout' })).not.toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Items' })).toBeInTheDocument();
    });
});

describe('ListView columns', () => {
    // The menu is a modal popover: the table behind it is hidden from the accessibility tree.
    const headers = () =>
        screen
            .getAllByRole('columnheader', { hidden: true })
            .map((header) => header.textContent ?? '');
    const withAuthor = [
        { ...columns[0], hideable: false },
        ...columns.slice(1),
        { id: 'author', label: 'Author', hidden: true },
    ] as typeof columns;

    it('shows, hides and orders the columns, in the URL of the list', async () => {
        const user = userEvent.setup();
        const router = createMemoryRouter();
        renderList(<ListView list={createList({ router })} columns={withAuthor} items={pages} />);
        expect(headers()).toEqual(['Title', 'Status', 'Published on']);

        await user.click(screen.getByRole('button', { name: 'Columns' }));
        const menu = await screen.findByRole('dialog', { name: 'Columns' });
        expect(within(menu).getByRole('checkbox', { name: 'Title' })).toBeDisabled();
        expect(within(menu).getByRole('button', { name: 'Reset columns' })).toBeDisabled();
        await user.click(within(menu).getByRole('checkbox', { name: 'Author' }));
        await user.click(within(menu).getByRole('checkbox', { name: 'Status' }));
        expect(headers()).toEqual(['Title', 'Published on', 'Author']);
        await user.click(within(menu).getByRole('button', { name: 'Move Author up' }));
        expect(headers()).toEqual(['Title', 'Author', 'Published on']);
        expect(router.getSearch()).toBe('columns=title%2Cauthor%2Cpublished_on');

        await user.click(within(menu).getByRole('button', { name: 'Reset columns' }));
        expect(headers()).toEqual(['Title', 'Status', 'Published on']);
        expect(router.getSearch()).toBe('');
    });

    it('opens in the layout and with the columns of its view', () => {
        const router = createMemoryRouter('layout=cards&columns=status');
        renderList(
            <ListView
                list={createList({ router })}
                columns={withAuthor}
                items={pages}
                layouts={['table', 'cards']}
            />,
        );
        const cards = screen.getByRole('list', { name: 'Items' });
        // The title can't be hidden: it comes back, at its place
        expect(within(cards).getAllByRole('listitem')[0]).toHaveTextContent(
            'About usStatusPublished',
        );
        expect(within(cards).getAllByRole('listitem')[0]).not.toHaveTextContent('Published on');
    });

    it('has no column choice when asked, or with one column', () => {
        const { unmount } = renderList(
            <ListView list={createList()} columns={columns} items={pages} columnChoice={false} />,
        );
        expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeInTheDocument();
        unmount();
        renderList(<ListView list={createList()} columns={columns.slice(0, 1)} items={pages} />);
        expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeInTheDocument();
    });
});

describe('ListView inline editing', () => {
    const nameField: Field = {
        name: 'name',
        type: 'text',
        label: 'Name',
        rules: [{ rule: 'required' }],
    };
    const activeField: Field = { name: 'active', type: 'boolean', label: 'Active' };
    const editable: ListColumn[] = [
        { id: 'name', label: 'Name', field: nameField, display: 'text' },
        { id: 'status', label: 'Status', field: statusField, display: 'select' },
        { id: 'active', label: 'Active', field: activeField, display: 'boolean' },
    ];
    const people: ListItem[] = [
        {
            id: '1',
            version: '3',
            name: 'Ada',
            status: 'draft',
            active: false,
            abilities: { update: true },
        },
        { id: '2', version: '1', name: 'Grace', status: 'draft', active: true, abilities: {} },
    ];
    const renderEditable = (onInlineEdit: ListInlineEditHandler) =>
        renderList(
            <ListView
                list={createList()}
                columns={editable}
                items={people}
                inlineEdit={['name', 'status', 'active']}
                onInlineEdit={onInlineEdit}
            />,
        );

    it('edits a text in place, and saves it with Enter', async () => {
        const user = userEvent.setup();
        const onInlineEdit = vi.fn<ListInlineEditHandler>(({ item, value }) =>
            Promise.resolve({ ...item, name: value, version: '4' }),
        );
        renderEditable(onInlineEdit);
        // Only the items that can be updated
        expect(screen.queryByRole('button', { name: 'Edit Name of Grace' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        const input = screen.getByRole('textbox', { name: 'Name' });
        expect(input).toHaveFocus();
        await user.clear(input);
        await user.type(input, 'Ada Lovelace{Enter}');
        expect(onInlineEdit).toHaveBeenCalledWith({
            item: people[0],
            field: nameField,
            value: 'Ada Lovelace',
        });
        expect(
            await screen.findByRole('button', { name: 'Edit Name of Ada Lovelace' }),
        ).toHaveFocus();
        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Ada Lovelace');
    });

    it('cancels with Escape, and checks the rules before it saves', async () => {
        const user = userEvent.setup();
        const onInlineEdit = vi.fn<ListInlineEditHandler>();
        renderEditable(onInlineEdit);
        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        await user.type(screen.getByRole('textbox', { name: 'Name' }), '!{Escape}');
        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Ada');
        expect(screen.queryByRole('textbox')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        await user.clear(screen.getByRole('textbox', { name: 'Name' }));
        await user.keyboard('{Enter}');
        expect(screen.getByText('This field is required.')).toBeInTheDocument();
        expect(onInlineEdit).not.toHaveBeenCalled();
    });

    it('shows the errors of the backend on the cell', async () => {
        const user = userEvent.setup();
        const onInlineEdit = vi.fn<ListInlineEditHandler>(() =>
            Promise.reject({
                problem: {
                    type: 'urn:panneau:problem:validation',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { name: ['This name is taken.'] },
                },
            }),
        );
        renderEditable(onInlineEdit);
        await user.click(screen.getByRole('button', { name: 'Edit Name of Ada' }));
        await user.type(screen.getByRole('textbox', { name: 'Name' }), ' L{Enter}');
        expect(await screen.findByText('This name is taken.')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada L');
    });

    it('saves a boolean when it changes, and offers to keep or save over a conflict', async () => {
        const user = userEvent.setup();
        const current = { ...people[0], version: '4', active: false, name: 'Ada L.' };
        const onInlineEdit = vi
            .fn<ListInlineEditHandler>()
            .mockRejectedValueOnce({
                problem: {
                    type: 'urn:panneau:problem:version-conflict',
                    title: 'The item was changed by someone else.',
                    status: 412,
                    current,
                },
            })
            .mockImplementationOnce(({ item, value }) =>
                Promise.resolve({ ...item, active: value, version: '5' }),
            );
        renderEditable(onInlineEdit);
        const row = () => screen.getAllByRole('row')[1] as HTMLElement;
        await user.click(within(row()).getByRole('checkbox', { name: 'Active' }));
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Someone else changed it to:');
        // The rest of the row shows what they saved
        expect(row()).toHaveTextContent('Ada L.');

        await user.click(within(alert).getByRole('button', { name: 'Save mine' }));
        expect(onInlineEdit).toHaveBeenLastCalledWith({
            item: current,
            field: activeField,
            value: true,
        });
        // The conflict leaves the cell; the toast that says it was saved offers "Undo"
        await waitFor(() => expect(within(row()).queryByRole('alert')).toBeNull());
        expect(within(row()).getByRole('checkbox', { name: 'Active' })).toBeChecked();
        expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });
});
