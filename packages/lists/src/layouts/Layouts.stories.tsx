import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';
import { Checkbox } from '@panneau/ui';

import { TextDisplay, builtInDisplays } from '../displays/displays';
import type { ListColumn, ListItem } from '../types';
import { CalendarLayout } from './CalendarLayout';
import { CardsLayout } from './CardsLayout';
import { GalleryLayout } from './GalleryLayout';
import { TableLayout } from './TableLayout';

const statusField: Field = {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published', tone: 'success' },
    ],
};

const columns: ListColumn[] = [
    { id: 'title', label: 'Title', sortable: true },
    { id: 'status', label: 'Status', field: statusField, display: 'select' },
    { id: 'published_on', label: 'Published on', display: 'date', sortable: true },
];

/** A cover drawn in place: stories don't fetch images. */
function cover(hue: number): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="hsl(${String(hue)} 60% 70%)"/><circle cx="2" cy="1.3" r="0.7" fill="hsl(${String(hue)} 40% 40%)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const items: ListItem[] = [
    {
        id: '1',
        title: 'The river festival returns',
        status: 'published',
        published_on: '2026-03-02',
        cover: cover(200),
    },
    {
        id: '2',
        title: 'A new bridge for the old port',
        status: 'published',
        published_on: '2026-03-15',
        cover: cover(30),
    },
    {
        id: '3',
        title: 'The annual report',
        status: 'draft',
        published_on: '2026-03-15',
        cover: null,
        pdf: true,
    },
    {
        id: '4',
        title: 'Winter market',
        status: 'draft',
        published_on: null,
        cover: null,
    },
];

/** What `ListView` renders with its displays: the display of each column, or text. */
function renderValue(item: ListItem, column: ListColumn) {
    const Display = builtInDisplays[column.display ?? 'text'] ?? TextDisplay;
    return (
        <Display value={item[column.id]} item={item} column={column} field={column.field ?? null} />
    );
}

/**
 * The layouts of a list, rendered on their own with the props `ListView` gives them: the items of
 * the page, their columns, their selection and their sort.
 */
const meta = {
    title: 'Lists/Layouts',
    // Every layout takes the same props: each story renders its own.
    component: TableLayout,
    parameters: { layout: 'padded' },
    args: {
        label: 'Articles',
        items,
        columns,
        renderValue,
        getItemLabel: (item) => String(item.title),
        getItemHref: (item) => `/articles/${item.id}`,
        selectable: true,
        isSelected: (item) => item.id === '2',
        onToggle: fn(),
        renderActions: () => null,
        sort: ['-published_on'],
        onSort: fn(),
        pageSelection: <Checkbox aria-label="Select the page" isIndeterminate />,
    },
} satisfies Meta<typeof TableLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A table, with sortable headers, a checkbox on each row, and the thumbnail of each item. */
export const Table: Story = {
    args: {
        getItemImage: (item) => (typeof item.cover === 'string' ? item.cover : null),
        getItemFileKind: (item) => (item.pdf === true ? 'document' : null),
    },
    render: (args) => <TableLayout {...args} />,
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Articles' });
        // A header row and a row for each item
        await expect(within(table).getAllByRole('row')).toHaveLength(5);
        await expect(within(table).getByRole('link', { name: 'Winter market' })).toHaveAttribute(
            'href',
            '/articles/4',
        );
        // The sort of the list on its header (after the one of the checkboxes), and a sort asked for
        const [, title, , publishedOn] = within(table).getAllByRole('columnheader', {
            hidden: true,
        });
        await expect(publishedOn).toHaveAttribute('aria-sort', 'descending');
        await expect(title).toHaveAttribute('aria-sort', 'none');
        await userEvent.click(within(table).getByRole('button', { name: 'Title' }));
        await expect(args.onSort).toHaveBeenCalledWith(expect.objectContaining({ id: 'title' }));
        // The selected item, and a checkbox that toggles another
        await expect(table.querySelector('[data-selected]')).toHaveAttribute('data-item-id', '2');
        await userEvent.click(
            within(table).getByRole('checkbox', { name: 'Select The river festival returns' }),
        );
        await expect(args.onToggle).toHaveBeenCalledWith(items[0]);
        // Two thumbnails, the icon of the document, and an empty square
        await expect(table.querySelectorAll('img')).toHaveLength(2);
        await expect(table.querySelector('[data-kind]')).toHaveAttribute('data-kind', 'document');
    },
};

/**
 * The intent to open an item, which an app uses to prefetch it: the pointer resting on the link of
 * an item for a moment, or the focus on it. A pointer that crosses rows calls nothing.
 */
export const ItemIntent: Story = {
    args: { onItemIntent: fn() },
    render: (args) => <TableLayout {...args} />,
    play: async ({ args, canvasElement }) => {
        const table = within(canvasElement).getByRole('table', { name: 'Articles' });
        const first = within(table).getByRole('link', { name: 'The river festival returns' });
        const second = within(table).getByRole('link', { name: 'A new bridge for the old port' });
        // Crossing a row: nothing
        await userEvent.hover(first);
        await userEvent.unhover(first);
        // Resting on one
        await userEvent.hover(second);
        await waitFor(() => expect(args.onItemIntent).toHaveBeenCalledWith(items[1]));
        await expect(args.onItemIntent).toHaveBeenCalledTimes(1);
        await userEvent.unhover(second);
        // The focus of the keyboard
        first.focus();
        await expect(args.onItemIntent).toHaveBeenLastCalledWith(items[0]);
        await expect(args.onItemIntent).toHaveBeenCalledTimes(2);
    },
};

/** Cards: the title, then the label and the value of each other column. */
export const Cards: Story = {
    args: { isCurrent: (item) => item.id === '1' },
    render: (args) => <CardsLayout {...args} />,
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const cards = within(canvas.getByRole('list', { name: 'Articles' })).getAllByRole(
            'listitem',
        );
        await expect(cards).toHaveLength(4);
        const first = within(cards[0] as HTMLElement);
        await expect(first.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Status',
            'Published on',
        ]);
        await expect(first.getByText('Mar 2, 2026')).toBeInTheDocument();
        // The item shown next to the list is the current page
        await expect(
            first.getByRole('link', { name: 'The river festival returns' }),
        ).toHaveAttribute('aria-current', 'page');
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Winter market' }));
        await expect(args.onToggle).toHaveBeenCalledWith(items[3]);
    },
};

/**
 * A gallery of the images of the items: a document without a preview shows the icon of its kind,
 * an item without an image a placeholder.
 */
export const Gallery: Story = {
    args: {
        getItemImage: (item) => (typeof item.cover === 'string' ? item.cover : null),
        getItemFileKind: (item) => (item.pdf === true ? 'document' : null),
        isHighlighted: (item) => item.id === '4',
    },
    render: (args) => <GalleryLayout {...args} />,
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const gallery = canvas.getByRole('list', { name: 'Articles' });
        await expect(within(gallery).getAllByRole('listitem')).toHaveLength(4);
        const images = gallery.querySelectorAll('img');
        await expect([...images].map((image) => image.getAttribute('src'))).toEqual([
            items[0]?.cover,
            items[1]?.cover,
        ]);
        await expect(gallery.querySelector('[data-kind]')).toHaveAttribute('data-kind', 'document');
        await expect(gallery.querySelector('[data-highlighted]')).toHaveAttribute(
            'data-item-id',
            '4',
        );
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select The annual report' }));
        await expect(args.onToggle).toHaveBeenCalledWith(items[2]);
    },
};

/** A calendar: the items on the day they were published, and buttons to change the month. */
export const Calendar: Story = {
    args: {
        selectable: false,
        calendar: {
            field: 'published_on',
            month: '2026-03',
            onMonthChange: fn(),
            more: null,
        },
    },
    render: (args) => <CalendarLayout {...args} />,
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByRole('table', { name: 'Articles, March 2026' });
        const itemsOn = (day: string) => {
            const cell = within(grid)
                .getAllByRole('cell')
                .find((candidate) => candidate.querySelector('time')?.dateTime === day);
            return within(cell as HTMLElement)
                .queryAllByRole('listitem')
                .map((item) => item.textContent);
        };
        await expect(itemsOn('2026-03-02')).toEqual(['The river festival returns']);
        await expect(itemsOn('2026-03-15')).toEqual([
            'A new bridge for the old port',
            'The annual report',
        ]);
        await expect(itemsOn('2026-03-16')).toEqual([]);
        await expect(grid).not.toHaveTextContent('Winter market');
        await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
        await expect(args.calendar?.onMonthChange).toHaveBeenCalledWith('2026-04');
    },
};
