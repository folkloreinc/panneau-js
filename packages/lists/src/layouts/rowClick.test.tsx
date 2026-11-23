import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

import { createList } from '@panneau/core';

import { ListView } from '../ListView';
import { columns, pages, publish } from '../__fixtures__/pages';
import { renderList } from '../__fixtures__/render';
import type { ListInlineEditHandler } from '../types';

function renderRows(ui: ReactElement) {
    const navigate = vi.fn();
    const view = renderList(<RouterProvider navigate={navigate}>{ui}</RouterProvider>);
    return { ...view, navigate };
}

const getItemHref = (item: { id: string }) => `/pages/${item.id}`;

/** The row of an item, by its title. */
function row(title: string): HTMLElement {
    const element = screen.getByRole('link', { name: title }).closest('tr');
    if (element === null) {
        throw new Error(`No row for ${title}`);
    }
    return element;
}

describe('a row that opens its item', () => {
    it('follows the link of its title when it is clicked outside its controls', async () => {
        const user = userEvent.setup();
        const onItemIntent = vi.fn();
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
                onItemIntent={onItemIntent}
            />,
        );
        await user.click(within(row('Contact')).getByText('Draft'));
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate.mock.calls[0]?.[0]).toBe('/pages/2');
        // The title keeps its prefetch on focus, next to the row's click
        screen.getByRole('link', { name: 'Blog' }).focus();
        expect(onItemIntent).toHaveBeenCalledWith(pages[2]);
    });

    it('stays out of the way of assistive technologies and the keyboard', () => {
        renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
            />,
        );
        const element = row('About us');
        expect(element).not.toHaveAttribute('role');
        expect(element).not.toHaveAttribute('tabindex');
        expect(within(element).getAllByRole('link')).toHaveLength(1);
    });

    it('hands modified clicks to the link, which the browser opens in a new tab', async () => {
        const user = userEvent.setup();
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
            />,
        );
        const link = screen.getByRole('link', { name: 'Contact' });
        const clicks: MouseEvent[] = [];
        link.addEventListener('click', (event) => {
            clicks.push(event);
            // jsdom doesn't navigate: what a browser would do with the click
            event.preventDefault();
        });
        await user.keyboard('{Meta>}');
        await user.click(within(row('Contact')).getByText('Draft'));
        await user.keyboard('{/Meta}');
        expect(clicks.map((event) => event.metaKey)).toEqual([true]);
        // The router leaves a modified click to the browser
        expect(navigate).not.toHaveBeenCalled();

        fireEvent(
            within(row('Contact')).getByText('Draft'),
            new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }),
        );
        expect(clicks).toHaveLength(2);
        expect(clicks[1]?.ctrlKey || clicks[1]?.metaKey).toBe(true);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('leaves clicks on its controls, its actions and the cells edited in place alone', async () => {
        const user = userEvent.setup();
        const onRun = vi.fn();
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
                actions={{ available: [{ ...publish, confirm: false }], onRun }}
                inline={{
                    fields: ['status'],
                    onEdit: vi.fn<ListInlineEditHandler>(({ item }) => Promise.resolve(item)),
                }}
            />,
        );
        await user.click(within(row('Contact')).getByRole('button', { name: /^Publish/ }));
        expect(onRun).toHaveBeenCalledTimes(1);
        // The value of a cell edited in place, and its button
        await user.click(within(row('Contact')).getByText('Draft'));
        await user.click(within(row('Contact')).getByRole('button', { name: /^Edit Status/ }));
        // The cell of the actions, around them
        const actionsCell = within(row('About us')).getAllByRole('cell').at(-1) as HTMLElement;
        await user.click(actionsCell);
        expect(navigate).not.toHaveBeenCalled();
        // The title itself is the link: one navigation
        await user.click(screen.getByRole('link', { name: 'Blog' }));
        expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('lets text in the row be selected', () => {
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
            />,
        );
        const text = within(row('Contact')).getByText('Draft');
        const selection = document.getSelection();
        // The click that ends a selection by dragging doesn't open the item (jsdom doesn't select
        // with the pointer).
        selection?.selectAllChildren(text);
        fireEvent.click(text);
        expect(navigate).not.toHaveBeenCalled();
        selection?.removeAllRanges();
        fireEvent.click(text);
        expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('selects its item in select mode', async () => {
        const user = userEvent.setup();
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
                actions={{ available: [publish] }}
            />,
        );
        await user.click(screen.getByRole('button', { name: 'Select' }));
        await user.click(within(row('Contact')).getByText('Draft'));
        expect(screen.getByRole('checkbox', { name: 'Select Contact' })).toBeChecked();
        expect(screen.getByText('1 item selected')).toBeInTheDocument();
        // The checkbox toggles it once, not twice
        await user.click(screen.getByRole('checkbox', { name: 'Select Contact' }));
        expect(screen.getByRole('checkbox', { name: 'Select Contact' })).not.toBeChecked();
        await user.click(within(row('Blog')).getByText('Draft'));
        expect(screen.getByRole('checkbox', { name: 'Select Blog' })).toBeChecked();
        expect(navigate).not.toHaveBeenCalled();
    });

    it('opens the item of a card, and of a tile of the gallery', async () => {
        const user = userEvent.setup();
        const { navigate } = renderRows(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                getItemHref={getItemHref}
                layouts={{ available: ['cards', 'gallery'] }}
                itemImage="cover"
            />,
        );
        const card = screen.getByRole('link', { name: 'Blog' }).closest('li') as HTMLElement;
        await user.click(within(card).getByText('Draft'));
        expect(navigate.mock.calls[0]?.[0]).toBe('/pages/3');
        await user.click(screen.getByRole('radio', { name: 'Gallery' }));
        const tile = screen.getByRole('link', { name: 'About us' }).closest('li') as HTMLElement;
        await user.click(tile);
        expect(navigate.mock.calls[1]?.[0]).toBe('/pages/1');
    });

    it('does nothing without a link', async () => {
        const user = userEvent.setup();
        const { navigate } = renderRows(
            <ListView list={createList()} columns={columns} items={pages} />,
        );
        const cell = screen.getByText('About us').closest('tr') as HTMLElement;
        expect(cell).not.toHaveAttribute('data-opens');
        await user.click(cell);
        expect(navigate).not.toHaveBeenCalled();
    });
});

describe('the action of an empty list', () => {
    it('is a link from a label and an href', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={[]}
                emptyAction={{ label: 'New page', href: '/pages/create' }}
            />,
        );
        expect(screen.getByRole('link', { name: 'New page' })).toHaveAttribute(
            'href',
            '/pages/create',
        );
    });

    it('is the node it is given', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={[]}
                emptyAction={<button type="button">New…</button>}
            />,
        );
        expect(screen.getByRole('button', { name: 'New…' })).toBeInTheDocument();
    });

    it('gives way to "Clear all" in a list emptied by its filters or its search', () => {
        renderList(
            <ListView
                list={createList({ query: { q: 'nothing' } })}
                columns={columns}
                items={[]}
                search
                emptyAction={{ label: 'New page', href: '/pages/create' }}
            />,
        );
        expect(screen.queryByRole('link', { name: 'New page' })).toBeNull();
        // In the empty state, and with the chips of the filters
        expect(screen.getAllByRole('button', { name: 'Clear all' }).length).toBeGreaterThan(0);
    });
});
