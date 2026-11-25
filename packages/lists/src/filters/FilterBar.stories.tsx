import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createMemoryRouter } from '@panneau/core';
import { FieldsProvider, type RelationSource } from '@panneau/fields';
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
 * The filters of a list's toolbar, each one a control with its label inside. Those with `primary`
 * show first (or the first 3), the others
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

const rect = (element: Element) => element.getBoundingClientRect();

/** Whether a box is inside another, to the pixel. */
function isInside(inner: Element, outer: Element): boolean {
    const [a, b] = [rect(inner), rect(outer)];
    return (
        a.left >= b.left - 1 &&
        a.right <= b.right + 1 &&
        a.top >= b.top - 1 &&
        a.bottom <= b.bottom + 1
    );
}

/** The parts of the toolbar of a list. */
function toolbarParts(canvasElement: HTMLElement) {
    const search = canvasElement.querySelector('[data-toolbar-search]');
    const end = canvasElement.querySelector('[data-toolbar-end]');
    const toolbar = end?.parentElement;
    const chips = [...canvasElement.querySelectorAll('[data-toolbar-filter]')];
    if (search === null || end === null || toolbar === null || toolbar === undefined) {
        throw new Error('The toolbar has no search or no controls');
    }
    return {
        toolbar,
        search,
        control: search.querySelector('.panneau-field-control') ?? search,
        end,
        chips,
    };
}

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

/**
 * When everything fits, one line (#519): the search, the filters, and the controls of the list at its
 * end. Each filter holds its label (`Status: Any`), is as high as the search, and sized to its
 * content.
 */
export const OnOneLine: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const { toolbar, search, control, end, chips } = toolbarParts(canvasElement);
        await waitFor(() => expect(toolbar).not.toHaveAttribute('data-rows'));
        const middle = (element: Element) => rect(element).top + rect(element).height / 2;
        for (const element of [...chips, end]) {
            await expect(Math.abs(middle(element) - middle(search))).toBeLessThan(2);
        }
        await expect(Math.abs(rect(end).right - rect(toolbar).right)).toBeLessThan(1);
        // The label inside its box, which is the label of the control for assistive technologies.
        // A select has it in its button: the whole box opens it.
        const status = canvas.getByRole('button', { name: /Status/ });
        const city = canvas.getByRole('textbox', { name: 'City' });
        const inside = status.querySelector('.panneau-list-box-inside-label');
        await expect(inside).toHaveTextContent('Status');
        await expect(isInside(inside as Element, status)).toBe(true);
        const box = status.closest('[data-toolbar-filter]') as HTMLElement;
        await expect(Math.abs(rect(status).left - rect(box).left)).toBeLessThan(2);
        await expect(Math.abs(rect(status).right - rect(box).right)).toBeLessThan(2);
        const item = city.closest('[data-toolbar-filter]') as HTMLElement;
        const label = within(item).getByText('City');
        await expect(isInside(label, item)).toBe(true);
        await expect(rect(label).right).toBeLessThanOrEqual(rect(city).left + 1);
        for (const element of [box, item]) {
            await expect(Math.round(rect(element).height)).toBe(Math.round(rect(control).height));
        }
        // Sized to its content: no chip is as wide as the controls of the filters were (12rem)
        await expect(rect(chips[0] as Element).width).toBeLessThan(160);
    },
};

/**
 * When they don't fit, two rows that stay put (#519): the search, which grows, and the controls of
 * the list at the end of its row; the filters under them, from the start, wrapping. A filter that
 * grows with its value moves none of the first row.
 */
export const OnTwoRows: Story = {
    args: { filters: filters.map((filter) => ({ ...filter, primary: true })) },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '46rem' }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const { toolbar, search, end, chips } = toolbarParts(canvasElement);
        await waitFor(() => expect(toolbar).toHaveAttribute('data-rows', '2'));
        const first = rect(search);
        // The first row: the search up to the controls, which are at its end
        await expect(Math.abs(rect(end).top - first.top)).toBeLessThan(first.height);
        await expect(Math.abs(rect(end).right - rect(toolbar).right)).toBeLessThan(1);
        await expect(first.width).toBeGreaterThan(16 * 16);
        await expect(rect(end).left - first.right).toBeLessThan(20);
        // The second row: every filter under it, the first at its start
        for (const chip of chips) {
            await expect(rect(chip).top).toBeGreaterThanOrEqual(first.bottom);
        }
        await expect(Math.abs(rect(chips[0] as Element).left - first.left)).toBeLessThan(1);
        // A value that makes a chip wider leaves the first row as it is
        await userEvent.type(
            canvas.getByRole('textbox', { name: 'City' }),
            'Saint-Jean-sur-Richelieu{Enter}',
        );
        await expect(
            await canvas.findByRole('button', { name: 'Clear the filter City' }),
        ).toBeVisible();
        await expect(rect(search)).toEqual(first);
        await expect(toolbar).toHaveAttribute('data-rows', '2');
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
 * A filter with a value is marked: its chip in the tones of what is selected
 * (`--panneau-selected-*`), and a button that clears it.
 */
export const ActiveFilter: Story = {
    args: { router: createMemoryRouter('filter[status]=draft') },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const shown = within(canvas.getByRole('group', { name: 'Filters' }));
        const status = () => shown.getByRole('button', { name: /^(?!Clear).*Status/ });
        // The chips of the filters draw their box (#519)
        const chip = (element: Element) => element.closest('[data-toolbar-filter]') ?? element;
        const active = status();
        const empty = canvas.getByRole('textbox', { name: 'City' });
        // The color of the token, as the browser resolves it
        const probe = canvasElement.ownerDocument.createElement('span');
        probe.style.color = 'var(--panneau-selected-bg, var(--panneau-color-accent))';
        active.parentElement?.append(probe);
        const selected = getComputedStyle(probe).color;
        probe.remove();
        await expect(getComputedStyle(chip(active)).borderTopColor).toBe(selected);
        await expect(getComputedStyle(chip(empty)).borderTopColor).not.toBe(selected);
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
        // Without the pointer on it, whose hover tone may match the tint
        await userEvent.unhover(unsorted);
        await userEvent.click(canvasElement);
        await waitFor(() =>
            expect(getComputedStyle(unsorted).backgroundColor).not.toBe(background),
        );
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

const authors = [
    { id: '7', label: 'Ada Lovelace' },
    { id: '8', label: 'Grace Hopper' },
];

/** A relation source without a backend: it finds the authors whose name has the text. */
const relationSource: RelationSource = {
    search: (_resource, query) =>
        Promise.resolve(
            authors.filter((author) => author.label.toLowerCase().includes(query.toLowerCase())),
        ),
    resolve: (_resource, ids) =>
        Promise.resolve(authors.filter((author) => ids.includes(author.id))),
};

/** A filter of each type, all shown first. */
const everyType: Filter[] = [
    { id: 'status', type: 'select', label: 'Status', options: statuses, primary: true },
    { id: 'author', type: 'relation', resource: 'authors', label: 'Author', primary: true },
    { id: 'day', type: 'date', label: 'Day', primary: true },
    { id: 'published', type: 'date-range', label: 'Published', primary: true },
    { id: 'city', type: 'text', label: 'City', primary: true },
    { id: 'featured', type: 'toggle', label: 'Featured', primary: true },
];

/**
 * A filter of each type: a select, a relation, a day, a range of days, a text and a switch. Each one
 * is a control like the others of the toolbar: as high as the search, with its radius and its
 * border, not a tag. It holds its label, which is part of the control: a press on it opens the
 * select, or focuses the other controls. With a value, its clear button is inside, at its end,
 * next to the value without covering it.
 */
export const EveryFilterType: Story = {
    args: {
        filters: everyType,
        router: createMemoryRouter(
            'filter[status]=draft&filter[author]=7&filter[day]=2026-10-15&filter[published][from]=2026-01-01&filter[published][to]=2026-03-31&filter[city]=Montr%C3%A9al&filter[featured]=true',
        ),
    },
    decorators: [
        (Story) => (
            <FieldsProvider relationSource={relationSource}>
                <Story />
            </FieldsProvider>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const { control, chips } = toolbarParts(canvasElement);
        await waitFor(() =>
            expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveValue('Ada Lovelace'),
        );
        // Each control keeps its name, from the label inside its chip
        const shown = within(canvas.getByRole('group', { name: 'Filters' }));
        const controls = [
            shown.getByRole('button', { name: /^(?!Clear).*Status/ }),
            shown.getByRole('combobox', { name: 'Author' }),
            shown.getAllByRole('group', { name: 'Day' })[0],
            shown.getByRole('group', { name: 'Published' }),
            shown.getByRole('textbox', { name: 'City' }),
            shown.getByRole('switch', { name: 'Featured' }),
        ];
        await expect(chips).toHaveLength(controls.length);
        for (const [index, element] of controls.entries()) {
            const chip = chips[index] as Element;
            await expect(chip).toContainElement(element as HTMLElement);
            await expect(chip).toHaveAttribute('data-active', 'true');
            // As high as the search
            await expect(Math.round(rect(chip).height)).toBe(Math.round(rect(control).height));
        }
        // A control, as the search is: its radius and its border, not those of a tag
        const field = getComputedStyle(control);
        for (const chip of chips) {
            await expect(getComputedStyle(chip).borderTopLeftRadius).toBe(
                field.borderTopLeftRadius,
            );
            await expect(getComputedStyle(chip).borderTopWidth).toBe(field.borderTopWidth);
        }
        // The clear button of each one inside its box, at its end, after the value (a switch says
        // itself that it is on)
        for (const name of ['Status', 'Author', 'Day', 'Published', 'City']) {
            const clear = canvas.getByRole('button', { name: `Clear the filter ${name}` });
            const chip = clear.closest('[data-toolbar-filter]');
            await expect(chip).not.toBeNull();
            await expect(isInside(clear, chip as Element)).toBe(true);
            await expect(rect(chip as Element).right - rect(clear).right).toBeLessThan(8);
            const value =
                name === 'Status'
                    ? (chip as Element).querySelector('.panneau-list-box-value')
                    : clear.previousElementSibling;
            await expect(value).not.toBeNull();
            await expect(rect(clear).left).toBeGreaterThanOrEqual(rect(value as Element).right - 1);
        }
        // The label is part of the control: a press on it opens the select, or focuses the control
        const pressLabel = async (name: string) => {
            const shownLabel = (element: Element) =>
                element.querySelector('.panneau-list-box-inside-label') ??
                element.querySelector('.panneau-field-label, legend');
            const chip = [...chips].find((element) =>
                shownLabel(element)?.textContent?.startsWith(name),
            );
            const label = chip !== undefined ? shownLabel(chip) : null;
            await expect(label).toBeDefined();
            await userEvent.click(label as Element);
        };
        await pressLabel('Status');
        await expect(
            await within(canvasElement.ownerDocument.body).findByRole('listbox'),
        ).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        await pressLabel('Author');
        await expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveFocus();
        await pressLabel('Day');
        await expect(
            within(shown.getAllByRole('group', { name: 'Day' })[0] as HTMLElement).getAllByRole(
                'spinbutton',
            )[0],
        ).toHaveFocus();
        await pressLabel('Published');
        await expect(
            within(shown.getByRole('group', { name: 'Published' })).getAllByRole('spinbutton')[0],
        ).toHaveFocus();
        const city = canvas.getByRole('textbox', { name: 'City' });
        await userEvent.click(canvas.getByRole('button', { name: 'Clear the filter City' }));
        await waitFor(() => expect(city).toHaveFocus());
        await expect(city.closest('[data-toolbar-filter]')).not.toHaveAttribute('data-active');
    },
};

/**
 * A list far down a page: the first press on a filter opens it, on its select or on its label, and
 * the page doesn't move.
 */
export const InAScrolledPage: Story = {
    decorators: [
        (Story) => (
            <div>
                <div style={{ height: '150vh' }} />
                <Story />
                <div style={{ height: '150vh' }} />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const view = canvasElement.ownerDocument.defaultView ?? window;
        const status = canvas.getByRole('button', { name: /Status/ });
        status.scrollIntoView({ block: 'center' });
        const scrolled = view.scrollY;
        await expect(scrolled).toBeGreaterThan(0);
        const label = status.querySelector('.panneau-list-box-inside-label');
        for (const target of [status, label]) {
            await userEvent.click(target as Element);
            const listBox = await body.findByRole('listbox');
            await waitFor(() => expect(listBox).toBeVisible());
            await expect(view.scrollY).toBe(scrolled);
            await userEvent.keyboard('{Escape}');
            await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
        }
    },
};
