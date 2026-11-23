import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createList } from '@panneau/core';
import { FieldsProvider, type RelationSource } from '@panneau/fields';

import { ItemDetails, type ItemDetailsColumn } from './ItemDetails';
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

const groupColumns: ItemDetailsColumn[] = [
    {
        id: 'address',
        label: 'Address',
        columns: [
            { id: 'city', label: 'City' },
            { id: 'country', label: 'Country' },
        ],
    },
];

describe('ItemDetails', () => {
    it('lists the values of an item with their labels and displays', () => {
        const { container } = renderList(
            <ItemDetails item={first(pages)} columns={columns} aria-label="About us" />,
        );
        expect(container.querySelector('dl')).toHaveAttribute('aria-label', 'About us');
        const details = container.querySelector('dl');
        const entries = [...(details?.children ?? [])];
        const terms = entries.map((entry) => entry.querySelector('dt')?.textContent);
        expect(terms).toEqual(['Title', 'Status', 'Published on']);
        const values = entries.map((entry) => entry.querySelector(':scope > dd'));
        // A localized value shows each of its locales.
        expect(values[0]).toHaveTextContent('About us');
        expect(values[0]).toHaveTextContent('À propos');
        // The label of the option, from the field.
        expect(values[1]).toHaveTextContent('Published');
        expect(values[2]?.querySelector('time')).toHaveAttribute('dateTime', '2026-03-02');
    });

    it('draws the labels and a skeleton of each value while the item loads', () => {
        const { container } = renderList(<ItemDetails item={undefined} columns={columns} />);
        expect(screen.getByRole('status')).toHaveTextContent('Loading the item…');
        const region = container.querySelector('[aria-busy="true"]');
        expect([...(region?.querySelectorAll('dt') ?? [])].map((term) => term.textContent)).toEqual(
            ['Title', 'Status', 'Published on'],
        );
        expect(region?.querySelectorAll('dd .panneau-skeleton')).toHaveLength(3);
    });

    it('lists the values of a group under its label', () => {
        renderList(
            <ItemDetails
                item={{ id: '1', address: { city: 'Montréal', country: 'Canada' } }}
                columns={groupColumns}
            />,
        );
        expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Address',
            'City',
            'Country',
        ]);
        const values = screen.getAllByRole('definition');
        expect(values[1]).toHaveTextContent('Montréal');
        expect(values[2]).toHaveTextContent('Canada');
    });

    it('draws a skeleton of each value of a group while the item loads', () => {
        const { container } = renderList(<ItemDetails item={undefined} columns={groupColumns} />);
        expect(
            container.querySelectorAll('[aria-busy="true"] dl dl .panneau-skeleton'),
        ).toHaveLength(2);
    });

    it('shows a group without a value with its labels', () => {
        renderList(<ItemDetails item={{ id: '1', address: null }} columns={groupColumns} />);
        expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Address',
            'City',
            'Country',
        ]);
    });

    it('takes displays over the built-in ones', () => {
        const Upper = ({ value }: DisplayProps) => <span>{String(value).toUpperCase()}</span>;
        const { container } = renderList(
            <ItemDetails item={first(pages)} columns={columns} displays={{ select: Upper }} />,
        );
        expect(
            container.querySelector('dl')?.querySelector(':scope > :nth-child(2) > dd'),
        ).toHaveTextContent('PUBLISHED');
    });
});

describe('ItemDetails values in full', () => {
    const relationSource: RelationSource = {
        search: () => Promise.resolve([]),
        getItemHref: (resource, id) => `/resources/${resource}/${id}`,
    };

    it('links related items through the relation source', () => {
        renderList(
            <FieldsProvider relationSource={relationSource}>
                <ItemDetails
                    item={{
                        id: '1',
                        authors: [
                            { id: '7', label: 'Ada Lovelace', description: 'Mathematician' },
                            { id: '8', label: 'Alan Turing' },
                        ],
                    }}
                    columns={[
                        {
                            id: 'authors',
                            label: 'Authors',
                            display: 'relation',
                            field: { name: 'authors', type: 'relation', resource: 'people' },
                        },
                    ]}
                />
            </FieldsProvider>,
        );
        const value = screen.getByRole('definition');
        const items = within(value).getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(within(value).getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
            'href',
            '/resources/people/7',
        );
        expect(value).toHaveTextContent('Mathematician');
        expect(within(value).getByRole('link', { name: 'Alan Turing' })).toHaveAttribute(
            'href',
            '/resources/people/8',
        );
    });

    it('shows related items as text without a relation source', () => {
        renderList(
            <ItemDetails
                item={{ id: '1', author: { id: '7', label: 'Ada Lovelace' } }}
                columns={[{ id: 'author', label: 'Author', display: 'relation' }]}
            />,
        );
        expect(screen.getByRole('definition')).toHaveTextContent('Ada Lovelace');
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('shows every media', () => {
        const { container } = renderList(
            <ItemDetails
                item={{
                    id: '1',
                    gallery: [
                        { id: 'a', label: 'Harbour', media: { thumbnailUrl: '/a.jpg' } },
                        { id: 'b', label: 'Bridge', media: { thumbnailUrl: '/b.jpg' } },
                    ],
                }}
                columns={[{ id: 'gallery', label: 'Gallery', display: 'media' }]}
            />,
        );
        const value = screen.getByRole('definition');
        expect(within(value).getAllByRole('listitem')).toHaveLength(2);
        expect(value).toHaveTextContent('Harbour');
        expect(value).toHaveTextContent('Bridge');
        expect(container.querySelectorAll('dd img')).toHaveLength(2);
    });

    it('shows text in full, with its line breaks, without the clamp of a cell', () => {
        const text = 'First line\nSecond line\nThird line';
        renderList(
            <ItemDetails
                item={{ id: '1', summary: text }}
                columns={[{ id: 'summary', label: 'Summary', display: 'textarea' }]}
            />,
        );
        const value = screen.getByRole('definition');
        expect(value.querySelector('[data-clamp]')).toBeNull();
        expect(value.textContent).toBe(text);
    });

    it('shows JSON in full', () => {
        const data = { description: 'x'.repeat(120) };
        renderList(
            <ItemDetails
                item={{ id: '1', data }}
                columns={[{ id: 'data', label: 'Data', display: 'json' }]}
            />,
        );
        expect(screen.getByRole('definition').textContent).toBe(JSON.stringify(data, null, 2));
    });

    it('shows each locale of a localized value, the locale of the interface first', () => {
        renderList(
            <FieldsProvider locales={['en', 'fr']}>
                <ItemDetails
                    item={{ id: '1', title: { en: 'About us', fr: 'À propos' } }}
                    columns={[
                        {
                            id: 'title',
                            label: 'Title',
                            display: 'text',
                            field: { name: 'title', type: 'text', localized: true },
                        },
                    ]}
                />
            </FieldsProvider>,
            { locale: 'fr-CA' },
        );
        const value = screen.getAllByRole('definition')[0];
        if (value === undefined) {
            throw new Error('No value.');
        }
        const names = within(value)
            .getAllByRole('term')
            .map((term) => term.textContent);
        expect(names).toEqual(['Français', 'Anglais']);
        const values = within(value).getAllByRole('definition');
        expect(values[0]).toHaveTextContent('À propos');
        expect(values[0]).toHaveAttribute('lang', 'fr');
        expect(values[1]).toHaveTextContent('About us');
    });

    it('shows an empty locale as empty', () => {
        renderList(
            <FieldsProvider locales={['en', 'fr']}>
                <ItemDetails
                    item={{ id: '1', title: { en: 'About us' } }}
                    columns={[
                        {
                            id: 'title',
                            label: 'Title',
                            field: { name: 'title', type: 'text', localized: true },
                        },
                    ]}
                />
            </FieldsProvider>,
        );
        const value = screen.getAllByRole('definition')[0];
        if (value === undefined) {
            throw new Error('No value.');
        }
        expect(
            within(value)
                .getAllByRole('term')
                .map((term) => term.textContent),
        ).toEqual(['English', 'French']);
        expect(within(value).getAllByRole('definition')[1]).toHaveTextContent('—');
    });

    it('leaves the displays of list cells unchanged', () => {
        const seen: DisplayProps[] = [];
        const Spy = (props: DisplayProps) => {
            seen.push(props);
            return null;
        };
        renderList(
            <ListView
                list={createList()}
                items={pages}
                columns={columns}
                aria-label="Pages"
                displays={{ select: Spy }}
            />,
        );
        expect(seen.length).toBeGreaterThan(0);
        expect(seen.every((props) => props.variant === undefined)).toBe(true);
        seen.length = 0;
        renderList(
            <ItemDetails item={first(pages)} columns={columns} displays={{ select: Spy }} />,
        );
        expect(seen.every((props) => props.variant === 'details')).toBe(true);
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
