import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createList } from '@panneau/core';

import { ItemDetails } from './ItemDetails';
import { ListView } from './ListView';
import { columns, pages } from './__fixtures__/pages';
import { renderList } from './__fixtures__/render';
import type { DisplayProps, ListItem } from './types';

function first(items: readonly ListItem[]): ListItem {
    const [item] = items;
    if (item === undefined) {
        throw new Error('No item.');
    }
    return item;
}

describe('ItemDetails', () => {
    it('lists the values of an item with their labels and displays', () => {
        const { container } = renderList(
            <ItemDetails item={first(pages)} columns={columns} aria-label="About us" />,
        );
        expect(container.querySelector('dl')).toHaveAttribute('aria-label', 'About us');
        const terms = screen.getAllByRole('term').map((term) => term.textContent);
        expect(terms).toEqual(['Title', 'Status', 'Published on']);
        const values = screen.getAllByRole('definition');
        expect(values[0]).toHaveTextContent('About us');
        // The label of the option, from the field.
        expect(values[1]).toHaveTextContent('Published');
        expect(values[2]?.querySelector('time')).toHaveAttribute('dateTime', '2026-03-02');
    });

    it('takes displays over the built-in ones', () => {
        const Upper = ({ value }: DisplayProps) => <span>{String(value).toUpperCase()}</span>;
        renderList(
            <ItemDetails item={first(pages)} columns={columns} displays={{ select: Upper }} />,
        );
        expect(screen.getAllByRole('definition')[1]).toHaveTextContent('PUBLISHED');
    });
});

describe('ListView with a current item', () => {
    it('marks the row of the current item and the link of its title', () => {
        renderList(
            <ListView
                list={createList()}
                items={pages}
                columns={columns}
                aria-label="Pages"
                getItemHref={(item) => `/pages/${item.id}`}
                currentItemId="2"
            />,
        );
        const rows = within(screen.getByRole('table', { name: 'Pages' })).getAllByRole('row');
        const row = (title: string) => {
            const found = rows.find((candidate) => candidate.textContent?.includes(title));
            if (found === undefined) {
                throw new Error(`No row for ${title}.`);
            }
            return found;
        };
        expect(row('Contact')).toHaveAttribute('data-current');
        expect(within(row('Contact')).getByRole('link', { name: 'Contact' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(row('About us')).not.toHaveAttribute('data-current');
        expect(within(row('About us')).getByRole('link', { name: 'About us' })).not.toHaveAttribute(
            'aria-current',
        );
    });
});
