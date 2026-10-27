import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Archive } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, createList, createMemoryRouter, definePlugin } from '@panneau/core';
import { fr } from '@panneau/intl';
import { PanneauRoot } from '@panneau/ui';

import { List } from './List';
import { ListView } from './ListView';
import {
    columns,
    edit,
    exportAction,
    manyPages,
    pages,
    publish,
    remove,
    statusField,
} from './__fixtures__/pages';
import { renderList } from './__fixtures__/render';
import type { DisplayProps } from './types';

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

        await user.click(screen.getByRole('button', { name: 'Actions for Contact' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
        expect(onAction).toHaveBeenCalledWith(
            expect.objectContaining({ scope: 'item', count: 1, item: pages[1] }),
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
        const user = userEvent.setup();
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
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Export' }).querySelector('svg')).toHaveClass(
                'lucide-file-down',
            ),
        );
        await user.click(screen.getByRole('button', { name: 'Actions for Contact' }));
        const item = await screen.findByRole('menuitem', { name: 'Delete' });
        expect(item.querySelector('svg')).toHaveClass('lucide-archive');
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
