import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createList, createMemoryRouter } from '@panneau/core';

import { List } from '../List';
import { ListView } from '../ListView';
import { columns, pages, publish } from '../__fixtures__/pages';
import { renderList } from '../__fixtures__/render';
import { getImageUrl } from '../images';
import type { ListItem } from '../types';
import { INTENT_DELAY } from './ItemTitle';

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
                layouts={{
                    available: ['gallery', 'table'],
                }}
            />,
        );
        const gallery = screen.getByRole('list', { name: 'Items' });
        expect(within(gallery).getAllByRole('listitem')).toHaveLength(3);
        expect(
            [...container.querySelectorAll('img')].map((image) => image.getAttribute('src')),
        ).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
        expect(within(gallery).getAllByRole('listitem')[2]).toHaveTextContent('Blog');
    });

    it('shows the icon of a document without a thumbnail, never a broken image', () => {
        const { container } = renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages.map((page, index) => ({
                    ...page,
                    media: [
                        { type: 'document', mime: 'application/pdf', thumbnailUrl: null },
                        { type: 'video', mime: 'video/mp4', thumbnailUrl: null },
                        null,
                    ][index],
                }))}
                itemImage="media"
                layouts={{
                    available: ['gallery', 'table'],
                }}
            />,
        );
        expect(container.querySelectorAll('img')).toHaveLength(0);
        expect(
            [...container.querySelectorAll('[data-kind]')].map((icon) =>
                icon.getAttribute('data-kind'),
            ),
        ).toEqual(['document', 'video']);
    });

    it('has the checkbox of each item under its image, not over it', async () => {
        const { container } = renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages.map((page) => ({ ...page, cover: 'https://example.com/a.jpg' }))}
                itemImage="cover"
                layouts={{
                    available: ['gallery'],
                }}
                actions={{
                    available: [publish],
                }}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Select' }));
        const checkbox = screen.getByRole('checkbox', { name: 'Select Blog' });
        const image = container.querySelectorAll('img')[2];
        expect(image?.parentElement).not.toContainElement(checkbox);
        await userEvent.click(checkbox);
        expect(checkbox.closest('li')).toHaveAttribute('data-selected');
    });

    it('is left out without the image of items', () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                layouts={{
                    available: ['gallery'],
                }}
            />,
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

    it('reads the URL of images only, or the thumbnail of other media', () => {
        expect(getImageUrl({ type: 'image', url: 'https://example.com/a.jpg' })).toBe(
            'https://example.com/a.jpg',
        );
        expect(getImageUrl({ type: 'document', url: 'https://example.com/b.pdf' })).toBeNull();
        expect(
            getImageUrl({
                type: 'video',
                url: 'https://example.com/c.mp4',
                thumbnailUrl: 'https://example.com/c.jpg',
            }),
        ).toBe('https://example.com/c.jpg');
        expect(getImageUrl({ name: 'd.pdf', url: '/d.pdf', mime: 'application/pdf' })).toBeNull();
        expect(getImageUrl({ name: 'e.png', url: '/e.png', mime: 'image/png' })).toBe('/e.png');
        expect(getImageUrl({ name: 'f.heic', url: '/f.heic', mime: 'image/heic' })).toBeNull();
    });
});

describe('the thumbnails of the table', () => {
    it('start each title with the image of its item, or an empty square', () => {
        const { container } = renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages.map((page, index) => ({
                    ...page,
                    cover: ['https://example.com/a.jpg', null, null][index],
                }))}
                itemImage="cover"
                layouts={{
                    available: ['table', 'gallery'],
                }}
            />,
        );
        const table = screen.getByRole('table', { name: 'Items' });
        const images = container.querySelectorAll('img');
        expect(images).toHaveLength(1);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/a.jpg');
        expect(images[0]).toHaveAttribute('alt', '');
        expect(images[0]).toHaveAttribute('loading', 'lazy');
        const [first] = within(table).getAllByRole('row').slice(1);
        expect(within(first as HTMLElement).getAllByRole('cell')[0]).toContainElement(
            images[0] as HTMLElement,
        );
        // The other items show an empty square, without an icon repeated on each row.
        const [, second] = within(table).getAllByRole('row').slice(1);
        const cell = within(second as HTMLElement).getAllByRole('cell')[0] as HTMLElement;
        expect(cell.querySelector('svg')).toBeNull();
    });

    it('shows the checkboxes once "Select" is pressed, and hides them with "Done"', async () => {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                layouts={{
                    available: ['table'],
                }}
                actions={{
                    available: [publish],
                }}
            />,
        );
        // Until then, rows read without a column of checkboxes before them.
        expect(screen.queryByRole('checkbox')).toBeNull();
        await userEvent.click(screen.getByRole('button', { name: 'Select' }));
        await userEvent.click(screen.getByRole('checkbox', { name: 'Select Blog' }));
        // A status of its own, beside the one of the results
        expect(screen.getByText('1 item selected').closest('[role="status"]')).not.toBeNull();
        await userEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(screen.queryByRole('checkbox')).toBeNull();
        expect(screen.queryByText('1 item selected')).toBeNull();
    });

    it('are left out without the image of items', () => {
        const { container } = renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                layouts={{
                    available: ['table'],
                }}
            />,
        );
        expect(container.querySelectorAll('img, td svg')).toHaveLength(0);
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
                layouts={{
                    available: ['calendar', 'table'],
                }}
                calendar={calendar}
                filters={[{ id: 'published_on', type: 'date-range', label: 'Date' }]}
                router={router}
            />,
            { locale: 'fr-CA' },
        );
        // The calendar's code loads when it shows
        const grid = await screen.findByRole('table', { name: 'Items, mars 2027' });
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

    it('shows a date range on each day it covers, and asks for the ranges that overlap the month', async () => {
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
                layouts={{
                    available: ['calendar'],
                }}
                calendar={{ field: 'dates', filter: 'dates' }}
                filters={[{ id: 'dates', type: 'date-range', label: 'Dates' }]}
                router={router}
            />,
        );
        const grid = await screen.findByRole('table', { name: 'Items, March 2027' });
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

    it('says when a month has more items than it shows', async () => {
        renderList(
            <ListView
                list={createList({
                    query: {},
                    defaults: { layout: 'calendar', calendar: { ...calendar, perPage: 2 } },
                })}
                columns={eventColumns}
                items={events.slice(0, 2)}
                total={12}
                layouts={{
                    available: ['calendar'],
                }}
                calendar={calendar}
            />,
        );
        expect(
            (
                await screen.findByText(
                    'The calendar shows 2 of 12 items. Filter the list to see the others.',
                )
            ).closest('[role="status"]'),
        ).not.toBeNull();
        expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
    });
});

describe('the intent to open an item', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    function renderWithIntent(layout: string, onItemIntent?: (item: ListItem) => void) {
        renderList(
            <ListView
                list={createList()}
                columns={columns}
                items={pages}
                layouts={{ available: [layout] }}
                getItemHref={(item) => (item.id === '3' ? null : `/pages/${item.id}`)}
                {...(onItemIntent !== undefined ? { onItemIntent } : {})}
            />,
        );
    }

    it.each(['table', 'cards', 'gallery'])(
        'is called once the pointer rests on the link of an item, in the %s',
        async (layout) => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            const onItemIntent = vi.fn();
            renderWithIntent(layout, onItemIntent);
            await user.hover(screen.getByRole('link', { name: 'About us' }));
            expect(onItemIntent).not.toHaveBeenCalled();
            act(() => vi.advanceTimersByTime(INTENT_DELAY));
            expect(onItemIntent).toHaveBeenCalledExactlyOnceWith(pages[0]);
        },
    );

    it('is not called when the pointer leaves before the delay, crossing rows', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onItemIntent = vi.fn();
        renderWithIntent('table', onItemIntent);
        const about = screen.getByRole('link', { name: 'About us' });
        const contact = screen.getByRole('link', { name: 'Contact' });
        await user.hover(about);
        await user.unhover(about);
        await user.hover(contact);
        await user.unhover(contact);
        act(() => vi.advanceTimersByTime(INTENT_DELAY * 2));
        expect(onItemIntent).not.toHaveBeenCalled();
    });

    it('is not called by the hover of touch', () => {
        const onItemIntent = vi.fn();
        renderWithIntent('table', onItemIntent);
        const link = screen.getByRole('link', { name: 'About us' });
        fireEvent.pointerOver(link, { pointerType: 'touch' });
        fireEvent.pointerEnter(link, { pointerType: 'touch' });
        act(() => vi.advanceTimersByTime(INTENT_DELAY * 2));
        expect(onItemIntent).not.toHaveBeenCalled();
    });

    it('is called when the link of an item gets the focus', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onItemIntent = vi.fn();
        renderWithIntent('table', onItemIntent);
        await user.tab();
        while (document.activeElement !== screen.getByRole('link', { name: 'About us' })) {
            await user.tab();
        }
        expect(onItemIntent).toHaveBeenCalledExactlyOnceWith(pages[0]);
    });

    it('is not called for an item without a link', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        const onItemIntent = vi.fn();
        renderWithIntent('table', onItemIntent);
        // The third page has no link: its title is text
        expect(screen.queryByRole('link', { name: 'Blog' })).toBeNull();
        await user.hover(screen.getByText('Blog'));
        act(() => vi.advanceTimersByTime(INTENT_DELAY * 2));
        expect(onItemIntent).not.toHaveBeenCalled();
    });

    it('is optional: links work without it', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithIntent('table');
        const link = screen.getByRole('link', { name: 'About us' });
        expect(link).toHaveAttribute('href', '/pages/1');
        await user.hover(link);
        act(() => vi.advanceTimersByTime(INTENT_DELAY * 2));
    });
});
