import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createList } from '@panneau/core';
import type { Filter } from '@panneau/protocol';

import { ListView } from '../ListView';
import { renderList } from '../__fixtures__/render';
import { splitFilters } from './FilterBar';

const columns = [{ id: 'title', label: 'Title' }];
const items = [{ id: '1', title: 'One' }];
const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
];
const filters: Filter[] = [
    { id: 'city', type: 'text', label: 'City' },
    { id: 'status', type: 'select', label: 'Status', options },
    { id: 'featured', type: 'toggle', label: 'Featured' },
    { id: 'kind', type: 'select', label: 'Kind', options },
    { id: 'author', type: 'text', label: 'Author' },
];

const ids = (list: readonly Filter[]) => list.map((filter) => filter.id);

describe('splitFilters', () => {
    it('shows the first 3 filters first, without a filter that says it is primary', () => {
        const { primary, secondary } = splitFilters(filters);
        expect(ids(primary)).toEqual(['city', 'status', 'featured']);
        expect(ids(secondary)).toEqual(['kind', 'author']);
    });

    it('shows the filters with `primary: true` first, and never those with `false`', () => {
        const chosen = filters.map((filter) =>
            filter.id === 'kind' ? { ...filter, primary: true } : filter,
        );
        expect(ids(splitFilters(chosen).primary)).toEqual(['kind']);
        const unwanted = filters.map((filter) =>
            filter.id === 'city' ? { ...filter, primary: false } : filter,
        );
        expect(ids(splitFilters(unwanted).primary)).toEqual(['status', 'featured', 'kind']);
        expect(splitFilters(filters.slice(0, 2)).secondary).toEqual([]);
    });
});

describe('FilterBar', () => {
    it('keeps the other filters behind "More filters", with the count of the active ones', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { kind: 'b' } } });
        renderList(<ListView list={list} columns={columns} items={items} filters={filters} />);
        const shown = screen.getByRole('group', { name: 'Filters' });
        expect(within(shown).getByRole('textbox', { name: 'City' })).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Author' })).not.toBeInTheDocument();
        // The value of a filter behind the button stays visible, as its chip
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent('Kind: B');

        await user.click(screen.getByRole('button', { name: 'More filters 1 active' }));
        const more = await screen.findByRole('group', { name: 'More filters' });
        await user.type(within(more).getByRole('textbox', { name: 'Author' }), 'Ada{Enter}');
        await waitFor(() =>
            expect(list.getState().query.filter).toEqual({ kind: 'b', author: 'Ada' }),
        );
        // Outside the open popover, the button is hidden from assistive technologies
        expect(
            screen.getByRole('button', { name: 'More filters 2 active', hidden: true }),
        ).toBeInTheDocument();
    });

    it('marks a filter with a value, and clears it from the control', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { city: 'Montréal' } } });
        renderList(<ListView list={list} columns={columns} items={items} filters={filters} />);
        const city = screen.getByRole('textbox', { name: 'City' });
        const item = city.closest('[data-active]');
        expect(item).not.toBeNull();
        expect(city).toHaveValue('Montréal');
        // Only filters with a value are marked
        expect(screen.getAllByRole('button', { name: /^Clear the filter/ })).toHaveLength(1);

        await user.click(screen.getByRole('button', { name: 'Clear the filter City' }));
        expect(list.getState().query.filter).toBeUndefined();
        expect(city.closest('[data-active]')).toBeNull();
        expect(city).toHaveFocus();
    });

    it('shows every filter behind one "Filters" button, in a sheet, for a narrow list', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { city: 'Laval', kind: 'a' } } });
        renderList(<ListView list={list} columns={columns} items={items} filters={filters} />);
        await user.click(screen.getByRole('button', { name: 'Filters 2 active' }));
        const sheet = await screen.findByRole('dialog', { name: 'Filters' });
        for (const name of ['City', 'Author']) {
            expect(within(sheet).getByRole('textbox', { name })).toBeInTheDocument();
        }
        await user.click(within(sheet).getByRole('button', { name: 'Clear all' }));
        expect(list.getState().query.filter).toBeUndefined();
        expect(within(sheet).queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
        await user.click(within(sheet).getByRole('button', { name: 'Done' }));
        await waitFor(() =>
            expect(screen.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument(),
        );
        expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    });
});
