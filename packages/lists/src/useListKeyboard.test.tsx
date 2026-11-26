import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createList } from '@panneau/core';

import { ListView, type ListViewProps } from './ListView';
import { columns, pages } from './__fixtures__/pages';
import { renderList } from './__fixtures__/render';

function setup(props: Partial<ListViewProps> = {}) {
    const user = userEvent.setup();
    const list = createList();
    renderList(
        <ListView
            list={list}
            columns={columns}
            items={pages}
            selectable
            search
            getItemHref={(item) => `/pages/${item.id}`}
            {...props}
        />,
    );
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    return { user, list, rows };
}

describe('the keyboard of a list', () => {
    it('moves the focus between rows with j and k, then the arrows, one row in the tab order', async () => {
        const { user, rows } = setup();
        await user.keyboard('j');
        expect(rows[0]).toHaveFocus();
        expect(rows[0]).toHaveAttribute('tabindex', '0');
        expect(rows[1]).toHaveAttribute('tabindex', '-1');
        await user.keyboard('j');
        expect(rows[1]).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(rows[2]).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(rows[2]).toHaveFocus();
        await user.keyboard('k{ArrowUp}');
        expect(rows[0]).toHaveFocus();
        expect(rows[0]).toHaveAttribute('tabindex', '0');
        expect(rows[2]).toHaveAttribute('tabindex', '-1');
    });

    it('leaves the keys alone while the user types in the search', async () => {
        const { user, rows } = setup();
        await user.click(screen.getByRole('searchbox'));
        await user.keyboard('jk');
        expect(screen.getByRole('searchbox')).toHaveValue('jk');
        expect(rows[0]).not.toHaveFocus();
    });

    it('goes to the search with /', async () => {
        const { user } = setup();
        await user.keyboard('/');
        expect(screen.getByRole('searchbox')).toHaveFocus();
        expect(screen.getByRole('searchbox')).toHaveValue('');
    });

    it('opens the focused item with Enter, as a click on its title', async () => {
        const { user } = setup();
        const click = vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => undefined);
        await user.keyboard('jj{Enter}');
        expect(click).toHaveBeenCalledTimes(1);
        expect(click.mock.contexts[0]).toHaveAttribute('href', `/pages/${String(pages[1]?.id)}`);
        click.mockRestore();
    });

    it('selects the focused row with x, and extends the selection with Shift', async () => {
        const { user, list } = setup();
        await user.keyboard('jx');
        expect(list.isSelected(String(pages[0]?.id))).toBe(true);
        await user.keyboard('x');
        expect(list.isSelected(String(pages[0]?.id))).toBe(false);
        await user.keyboard('x{Shift>}{ArrowDown}J{/Shift}');
        expect(pages.every((page) => list.isSelected(String(page.id)))).toBe(true);
    });

    it('extends the selection with Shift and a click on a checkbox', async () => {
        const { user, list } = setup();
        await user.keyboard('jx');
        const last = screen.getAllByRole('checkbox', { name: /^Select / }).at(-1) as HTMLElement;
        await user.keyboard('{Shift>}');
        await user.click(last);
        await user.keyboard('{/Shift}');
        expect(pages.every((page) => list.isSelected(String(page.id)))).toBe(true);
    });

    it('clears the selection with Escape, then leaves the row', async () => {
        const { user, list, rows } = setup();
        await user.keyboard('jx{Escape}');
        expect(list.getSelectedCount(pages.length)).toBe(0);
        expect(rows[0]).toHaveFocus();
        await user.keyboard('{Escape}');
        expect(rows[0]).not.toHaveFocus();
        expect(screen.getByRole('group', { name: 'Items' })).toHaveFocus();
    });

    it('lists its shortcuts in the help', async () => {
        const { user } = setup();
        await user.keyboard('j?');
        const help = await screen.findByRole('dialog');
        expect(within(help).getByText('Lists')).toBeInTheDocument();
        expect(within(help).getByText('Next item')).toBeInTheDocument();
        expect(within(help).getByText('Open the item')).toBeInTheDocument();
        expect(within(help).getByText('Search the list')).toBeInTheDocument();
    });
});
