import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createList } from '@panneau/core';
import { FieldsProvider, type RelationSource } from '@panneau/fields';

import { ListView } from '../ListView';
import { renderList } from '../__fixtures__/render';

const columns = [{ id: 'title', label: 'Title' }];
const items = [{ id: '1', title: 'One' }];

describe('filters', () => {
    it('sets a text filter once the user stops typing', async () => {
        const user = userEvent.setup();
        const list = createList();
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={items}
                filters={[{ id: 'city', type: 'text', label: 'City' }]}
            />,
        );
        await user.type(screen.getByRole('textbox', { name: 'City' }), 'Montréal');
        await waitFor(() => expect(list.getState().query.filter).toEqual({ city: 'Montréal' }));
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'City: Montréal',
        );
    });

    it('shows a date range from the query, with an open end', () => {
        const list = createList({ query: { filter: { published_at: { from: '2026-01-05' } } } });
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={items}
                filters={[{ id: 'published_at', type: 'date-range', label: 'Published' }]}
            />,
        );
        expect(screen.getByRole('group', { name: 'Published' })).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Published: Jan 5, 2026 – …',
        );
    });

    it('sets the bounds of a date range, and leaves an open end out', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { published_at: { to: '2026-01-31' } } } });
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={items}
                filters={[{ id: 'published_at', type: 'date-range', label: 'Published' }]}
            />,
        );
        const range = screen.getByRole('group', { name: 'Published' });
        const to = within(within(range).getByRole('group', { name: 'To' })).getAllByRole(
            'spinbutton',
        );
        await user.click(to[1] as HTMLElement);
        await user.keyboard('{ArrowDown}');
        expect(list.getState().query.filter).toEqual({ published_at: { to: '2026-01-30' } });
        const from = within(within(range).getByRole('group', { name: 'From' })).getAllByRole(
            'spinbutton',
        );
        await user.click(from[0] as HTMLElement);
        await user.keyboard('1');
        await user.click(from[1] as HTMLElement);
        await user.keyboard('5');
        await user.click(from[2] as HTMLElement);
        await user.keyboard('2026');
        expect(list.getState().query.filter).toEqual({
            published_at: { from: '2026-01-05', to: '2026-01-30' },
        });
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Published: Jan 5, 2026 – Jan 30, 2026',
        );
    });

    it('filters by a related item, and keeps its label for the chip', async () => {
        const user = userEvent.setup();
        const list = createList();
        const source: RelationSource = {
            search: () => Promise.resolve([{ id: '7', label: 'Ada Lovelace' }]),
        };
        renderList(
            <FieldsProvider relationSource={source}>
                <ListView
                    list={list}
                    columns={columns}
                    items={items}
                    filters={[
                        { id: 'author', type: 'relation', resource: 'authors', label: 'Author' },
                    ]}
                />
            </FieldsProvider>,
        );
        await user.click(screen.getByRole('combobox', { name: 'Author' }));
        await user.click(await screen.findByRole('option', { name: 'Ada Lovelace' }));
        expect(list.getState().query.filter).toEqual({ author: '7' });
        const chips = screen.getByRole('list', { name: 'Active filters' });
        expect(within(chips).getByText('Ada Lovelace')).toBeInTheDocument();
    });

    it('resolves the labels of related ids from the query, for the chip and the picker', async () => {
        const source: RelationSource = {
            search: () => Promise.resolve([]),
            resolve: (_resource, ids) =>
                Promise.resolve(ids.includes('7') ? [{ id: '7', label: 'Ada Lovelace' }] : []),
        };
        const list = createList({ query: { filter: { author: '7' } } });
        renderList(
            <FieldsProvider relationSource={source}>
                <ListView
                    list={list}
                    columns={columns}
                    items={items}
                    filters={[
                        { id: 'author', type: 'relation', resource: 'authors', label: 'Author' },
                    ]}
                />
            </FieldsProvider>,
        );
        const chips = screen.getByRole('list', { name: 'Active filters' });
        await waitFor(() => expect(chips).toHaveTextContent('Author: Ada Lovelace'));
        expect(screen.getByRole('combobox', { name: 'Author' })).toHaveValue('Ada Lovelace');
    });
});
