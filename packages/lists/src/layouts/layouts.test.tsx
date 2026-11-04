import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createList, createMemoryRouter } from '@panneau/core';

import { List } from '../List';
import { ListView } from '../ListView';
import { columns, pages } from '../__fixtures__/pages';
import { renderList } from '../__fixtures__/render';
import { getImageUrl } from '../images';
import type { ListItem } from '../types';

const events: ListItem[] = [
    { id: '1', title: 'Kick-off', published_on: '2027-03-02' },
    { id: '2', title: 'Judging', published_on: '2027-03-15T14:00:00' },
    { id: '3', title: 'Briefing', published_on: '2027-03-15T09:00:00' },
    { id: '4', title: 'Ceremony', published_on: '2027-04-20' },
];
const eventColumns = [{ id: 'title', label: 'Title' }];
const calendar = { field: 'published_on', filter: 'published_on' };

describe('the gallery', () => {
    it('shows the image of each item, or a placeholder', () => {
        const { container } = renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages.map((page, index) => ({
                    ...page,
                    cover: [
                        'https://example.com/a.jpg',
                        { media: { thumbnailUrl: 'https://example.com/b.jpg' } },
                        null,
                    ][index],
                }))}
                itemImage="cover"
                layouts={['gallery', 'table']}
            />,
        );
        const gallery = screen.getByRole('list', { name: 'Items' });
        expect(within(gallery).getAllByRole('listitem')).toHaveLength(3);
        expect(
            [...container.querySelectorAll('img')].map((image) => image.getAttribute('src')),
        ).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
        expect(within(gallery).getAllByRole('listitem')[2]).toHaveTextContent('Blog');
    });

    it('is left out without the image of items', () => {
        renderList(
            <ListView list={createList()} columns={columns} items={pages} layouts={['gallery']} />,
        );
        expect(screen.getByRole('table', { name: 'Items' })).toBeInTheDocument();
    });

    it('reads the URL of media references, files and URLs', () => {
        expect(getImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
        expect(getImageUrl({ url: 'https://example.com/b.pdf' })).toBe('https://example.com/b.pdf');
        expect(getImageUrl([{ media: { url: 'https://example.com/c.jpg' } }])).toBe(
            'https://example.com/c.jpg',
        );
        expect(getImageUrl({ media: {} })).toBeNull();
        expect(getImageUrl(null)).toBeNull();
    });
});

describe('the calendar', () => {
    it('shows the items on the days of their month, in the order of their dates', async () => {
        const user = userEvent.setup();
        const router = createMemoryRouter('month=2027-03');
        renderList(
            <List
                columns={eventColumns}
                items={events}
                layouts={['calendar', 'table']}
                calendar={calendar}
                filters={[{ id: 'published_on', type: 'date-range', label: 'Date' }]}
                router={router}
            />,
            { locale: 'fr-CA' },
        );
        const grid = screen.getByRole('table', { name: 'Items, mars 2027' });
        // The filter of the calendar is its own
        expect(screen.queryByRole('group', { name: 'Date' })).toBeNull();
        const fifteenth = within(grid)
            .getAllByRole('cell')
            .find((cell) => cell.querySelector('time')?.getAttribute('dateTime') === '2027-03-15');
        expect(
            within(fifteenth as HTMLElement)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Briefing', 'Judging']);
        expect(grid).not.toHaveTextContent('Ceremony');
        // A week starts on Sunday in Canadian French
        expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent('dim.');

        await user.click(screen.getByRole('button', { name: 'Next month' }));
        expect(router.getSearch()).toBe('month=2027-04');
        expect(screen.getByRole('table', { name: 'Items, avril 2027' })).toHaveTextContent(
            'Ceremony',
        );
    });

    it('shows a date range on each day it covers, and asks for the ranges that overlap the month', () => {
        const router = createMemoryRouter('month=2027-03');
        const festivals: ListItem[] = [
            { id: '1', title: 'Festival', dates: { start: '2027-02-27', end: '2027-03-02' } },
            { id: '2', title: 'Exhibition', dates: { start: '2027-03-20', end: null } },
            { id: '3', title: 'Winter', dates: { start: '2027-01-10', end: '2027-02-10' } },
        ];
        renderList(
            <List
                columns={eventColumns}
                items={festivals}
                layouts={['calendar']}
                calendar={{ field: 'dates', filter: 'dates' }}
                filters={[{ id: 'dates', type: 'date-range', label: 'Dates' }]}
                router={router}
            />,
        );
        const grid = screen.getByRole('table', { name: 'Items, March 2027' });
        const itemsOn = (day: string) => {
            const cell = within(grid)
                .getAllByRole('cell')
                .find(
                    (candidate) =>
                        candidate.querySelector('time')?.getAttribute('dateTime') === day,
                );
            return within(cell as HTMLElement)
                .queryAllByRole('listitem')
                .map((item) => item.textContent);
        };
        expect(itemsOn('2027-02-28')).toEqual(['Festival']);
        expect(itemsOn('2027-03-02')).toEqual(['Festival']);
        expect(itemsOn('2027-03-03')).toEqual([]);
        // A range open at its end shows on its first day.
        expect(itemsOn('2027-03-20')).toEqual(['Exhibition']);
        expect(itemsOn('2027-03-21')).toEqual([]);
        expect(grid).not.toHaveTextContent('Winter');
    });

    it('says when a month has more items than it shows', () => {
        renderList(
            <ListView
                list={createList({
                    query: {},
                    defaults: { layout: 'calendar', calendar: { ...calendar, perPage: 2 } },
                })}
                columns={eventColumns}
                items={events.slice(0, 2)}
                total={12}
                layouts={['calendar']}
                calendar={calendar}
            />,
        );
        expect(screen.getByRole('status')).toHaveTextContent(
            'The calendar shows 2 of 12 items. Filter the list to see the others.',
        );
        expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
    });
});
