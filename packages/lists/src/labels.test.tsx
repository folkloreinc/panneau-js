import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createList } from '@panneau/core';

import { ItemDetails } from './ItemDetails';
import { List } from './List';
import { ListView } from './ListView';
import { renderList } from './__fixtures__/render';
import { getColumnLabel, getColumnText } from './columns';
import type { ListColumn } from './types';

// Columns, filters and fields without a label show their key made readable (issue 408).
const columns: ListColumn[] = [
    { id: 'title', label: 'Title', sortable: true },
    { id: 'published_at', sortable: true },
    { id: 'author_id' },
];
const items = [
    { id: '1', title: 'About', published_at: 'Monday', author_id: 'Ada' },
    { id: '2', title: 'Contact', published_at: 'Tuesday', author_id: 'Grace' },
];

describe('the labels of columns', () => {
    it('keep a given label, an empty one included, and read the id without one', () => {
        expect(getColumnLabel({ id: 'published_at', label: 'Publié' })).toBe('Publié');
        expect(getColumnLabel({ id: 'published_at', label: '' })).toBe('');
        expect(getColumnLabel({ id: 'published_at' })).toBe('Published at');
        expect(getColumnText({ id: 'author_id', label: <em>Author</em> })).toBe('Author');
    });

    it('head the columns of the table', () => {
        renderList(<List columns={columns} items={items} />);
        const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
        expect(headers).toEqual(expect.arrayContaining(['Title', 'Published at', 'Author']));
        expect(headers).not.toContain('published_at');
    });

    it('name the values of the cards and the options of the sort', async () => {
        const user = userEvent.setup();
        renderList(
            <List columns={columns} items={items} layouts={{ available: ['table', 'cards'] }} />,
        );
        await user.click(screen.getByRole('radio', { name: 'Cards' }));
        const cards = screen.getByRole('list', { name: 'Items' });
        expect(within(cards).getAllByRole('listitem')[0]).toHaveTextContent('Published atMonday');
        await user.click(screen.getByRole('button', { name: /Sort by/ }));
        expect(
            await screen.findByRole('option', { name: 'Published at, descending' }),
        ).toBeInTheDocument();
    });

    it('name the values of the details of an item', () => {
        const { container } = renderList(
            <ItemDetails item={items[0] ?? { id: '1' }} columns={columns} />,
        );
        const terms = [...container.querySelectorAll('dt')].map((term) => term.textContent);
        expect(terms).toEqual(['Title', 'Published at', 'Author']);
    });
});

describe('the labels of filters', () => {
    it('read the label of their field, or their id', async () => {
        const user = userEvent.setup();
        const list = createList({ query: { filter: { published_at: 'x' } } });
        renderList(
            <ListView
                list={list}
                columns={columns}
                items={items}
                filters={[
                    { id: 'published_at', type: 'text' },
                    { id: 'status', type: 'select', options: [{ value: 'draft', label: 'Draft' }] },
                ]}
                fields={[{ name: 'status', type: 'select', label: 'État' }]}
            />,
        );
        expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Published at',
        );
        await user.click(screen.getByRole('button', { name: /État/ }));
        expect(await screen.findByRole('option', { name: 'Draft' })).toBeInTheDocument();
    });
});
