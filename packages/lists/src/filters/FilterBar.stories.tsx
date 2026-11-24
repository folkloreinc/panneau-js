import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createMemoryRouter } from '@panneau/core';
import type { Filter } from '@panneau/protocol';

import { List } from '../List';
import type { ListColumn, ListItem } from '../types';

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
];
const sections = [
    { value: 'news', label: 'News' },
    { value: 'culture', label: 'Culture' },
];

const columns: ListColumn[] = [
    { id: 'title', label: 'Title' },
    {
        id: 'status',
        label: 'Status',
        display: 'select',
        field: { name: 'status', type: 'select', options: statuses },
    },
    {
        id: 'section',
        label: 'Section',
        display: 'select',
        field: { name: 'section', type: 'select', options: sections },
    },
];

const items: ListItem[] = Array.from({ length: 12 }, (_, index) => ({
    id: String(index + 1),
    title: `Article ${String(index + 1)}`,
    status: index % 3 === 0 ? 'draft' : 'published',
    section: index % 2 === 0 ? 'news' : 'culture',
    city: index % 4 === 0 ? 'Montréal' : 'Québec',
    featured: index % 5 === 0,
    author: index % 2 === 0 ? 'Ada' : 'Grace',
}));

/** Five filters: the first three show, the others are behind "More filters". */
const filters: Filter[] = [
    { id: 'status', type: 'select', label: 'Status', options: statuses },
    { id: 'featured', type: 'toggle', label: 'Featured' },
    { id: 'city', type: 'text', label: 'City' },
    { id: 'section', type: 'select', label: 'Section', options: sections },
    { id: 'author', type: 'text', label: 'Author' },
];

/**
 * The filters of a list's toolbar. Those with `primary` show first (or the first 3), the others
 * behind "More filters", with the count of the active ones. A filter with a value is marked, and
 * keeps its chip under the toolbar. In a narrow list, every filter is behind one "Filters" button.
 */
const meta = {
    title: 'Lists/Filter bar',
    component: List,
    parameters: { layout: 'padded' },
    args: {
        'aria-label': 'Articles',
        columns,
        items,
        perPage: 5,
        search: true,
        filters,
        router: null,
    },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The other filters are behind "More filters", which counts the active ones. */
export const MoreFilters: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.getByRole('textbox', { name: 'City' })).toBeVisible();
        await expect(canvas.queryByRole('textbox', { name: 'Author' })).not.toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'More filters' }));
        const more = await body.findByRole('group', { name: 'More filters' });
        await userEvent.click(within(more).getByRole('button', { name: /Section/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Culture' }));
        await userEvent.keyboard('{Escape}');
        await expect(
            await canvas.findByRole('button', { name: 'More filters 1 active' }),
        ).toBeVisible();
        // The value of a filter behind the button stays visible, as its chip
        await expect(canvas.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Section: Culture',
        );
    },
};

/** The filters a definition shows first (`primary: true`), whatever their place. */
export const PrimaryFilters: Story = {
    args: {
        filters: filters.map((filter) =>
            filter.id === 'author' ? { ...filter, primary: true } : filter,
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'Author' })).toBeVisible();
        await expect(canvas.queryByRole('textbox', { name: 'City' })).not.toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'More filters' })).toBeVisible();
    },
};

/**
 * A filter with a value is marked: its input in the tones of what is selected
 * (`--panneau-selected-*`), and a button that clears it.
 */
export const ActiveFilter: Story = {
    args: { router: createMemoryRouter('filter[status]=draft') },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const shown = within(canvas.getByRole('group', { name: 'Filters' }));
        const status = () => shown.getByRole('button', { name: /^(?!Clear).*Status/ });
        const active = status();
        const empty = canvas.getByRole('textbox', { name: 'City' });
        // The color of the token, as the browser resolves it
        const probe = canvasElement.ownerDocument.createElement('span');
        probe.style.color = 'var(--panneau-selected-bg, var(--panneau-color-accent))';
        active.parentElement?.append(probe);
        const selected = getComputedStyle(probe).color;
        probe.remove();
        await expect(getComputedStyle(active).borderTopColor).toBe(selected);
        await expect(getComputedStyle(empty).borderTopColor).not.toBe(selected);
        // Not only by color: a button clears it, inside the select, in place of its arrow (#487)
        const clear = canvas.getByRole('button', { name: 'Clear the filter Status' });
        const box = active.getBoundingClientRect();
        const button = clear.getBoundingClientRect();
        await expect(button.left).toBeGreaterThanOrEqual(box.left);
        await expect(button.right).toBeLessThanOrEqual(box.right + 1);
        await expect(button.top).toBeGreaterThanOrEqual(box.top - 1);
        await expect(button.bottom).toBeLessThanOrEqual(box.bottom + 1);
        const arrow = active.querySelector('svg:last-of-type');
        await expect(arrow === null ? 'hidden' : getComputedStyle(arrow).visibility).toBe('hidden');
        await userEvent.click(clear);
        await expect(
            canvas.queryByRole('list', { name: 'Active filters' }),
        ).not.toBeInTheDocument();
        await waitFor(() => expect(status()).toHaveFocus());
        await expect(
            canvas.queryByRole('button', { name: 'Clear the filter Status' }),
        ).not.toBeInTheDocument();
    },
};

/**
 * A list sorted by a column: its sort button in the tones of what is selected, as a filter with a
 * value. The default sort can't be emptied, so it has no clear button.
 */
export const SortedBy: Story = {
    args: {
        columns: columns.map((column) =>
            column.id === 'title' ? { ...column, sortable: true } : column,
        ),
        router: createMemoryRouter('sort=-title'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const sort = canvas.getByRole('button', { name: /^Sort by: / });
        // The colors of the tokens, as the browser resolves them
        const probe = canvasElement.ownerDocument.createElement('span');
        probe.style.color = 'var(--panneau-selected-bg, var(--panneau-color-accent))';
        probe.style.backgroundColor =
            'var(--panneau-selected-subtle, var(--panneau-color-accent-subtle))';
        sort.parentElement?.append(probe);
        const selected = getComputedStyle(probe);
        const [border, background] = [selected.color, selected.backgroundColor];
        probe.remove();
        await expect(getComputedStyle(sort).borderTopColor).toBe(border);
        await expect(getComputedStyle(sort).backgroundColor).toBe(background);
        await expect(canvas.queryByRole('button', { name: /Clear.*sort/i })).toBeNull();
        // Back to the default sort: the button is as the others
        await userEvent.click(sort);
        await userEvent.click(await body.findByRole('menuitemradio', { name: 'Default' }));
        const unsorted = await canvas.findByRole('button', { name: 'Sort by' });
        await expect(getComputedStyle(unsorted).backgroundColor).not.toBe(background);
    },
};

/**
 * On a phone: the search, and every filter behind one "Filters" button with the count of the
 * active ones, so the first items show on the first screen. The filters open in a sheet.
 */
export const OnAPhone: Story = {
    args: { router: createMemoryRouter('filter[section]=news') },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const search = canvas.getByRole('searchbox', { name: 'Search' });
        const button = canvas.getByRole('button', { name: 'Filters 1 active' });
        await expect(button).toBeVisible();
        await expect(
            canvas.getByRole('button', { name: /^More filters/, hidden: true }),
        ).not.toBeVisible();
        await expect(canvas.getByRole('textbox', { name: 'City', hidden: true })).not.toBeVisible();
        // The search and the button on one row
        const top = (element: Element) => element.getBoundingClientRect().top;
        await expect(Math.abs(top(search) - top(button))).toBeLessThan(
            button.getBoundingClientRect().height,
        );

        await userEvent.click(button);
        const sheet = await body.findByRole('dialog', { name: 'Filters' });
        await userEvent.click(within(sheet).getByRole('switch', { name: 'Featured' }));
        await userEvent.click(within(sheet).getByRole('button', { name: 'Done' }));
        await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
        await expect(canvas.getByRole('button', { name: 'Filters 2 active' })).toBeVisible();
        await expect(canvas.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Featured',
        );
    },
};
