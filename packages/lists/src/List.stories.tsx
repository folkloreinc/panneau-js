import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMinus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { createList, createMemoryRouter } from '@panneau/core';
import type { Action, Field } from '@panneau/protocol';
import { Button } from '@panneau/ui';

import { List } from './List';
import { ListView } from './ListView';
import type { ListColumn, ListItem } from './types';

/** The background of an element once its transitions are over (buttons fade their hover in). */
async function settledBackground(element: Element): Promise<string> {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    return getComputedStyle(element).backgroundColor;
}

/** The channels of a computed color, `rgb()` or `color(srgb …)`, from 0 to 1. */
function parseColor(value: string): [number, number, number, number] {
    const rgb = /rgba?\(([\d.]+),? ([\d.]+),? ([\d.]+)(?:,? \/? ?([\d.]+))?\)/.exec(value);
    if (rgb !== null) {
        return [
            Number(rgb[1]) / 255,
            Number(rgb[2]) / 255,
            Number(rgb[3]) / 255,
            rgb[4] !== undefined ? Number(rgb[4]) : 1,
        ];
    }
    const srgb = /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/.exec(value);
    if (srgb !== null) {
        return [
            Number(srgb[1]),
            Number(srgb[2]),
            Number(srgb[3]),
            srgb[4] !== undefined ? Number(srgb[4]) : 1,
        ];
    }
    throw new Error(`Unknown color: ${value}`);
}

/** The relative luminance of a color over an opaque one. */
function luminanceOver(color: string, under: string): number {
    const [r, g, b, a] = parseColor(color);
    const [ur, ug, ub] = parseColor(under);
    const linear = (channel: number) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    const [lr, lg, lb] = [r * a + ur * (1 - a), g * a + ug * (1 - a), b * a + ub * (1 - a)].map(
        linear,
    ) as [number, number, number];
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** The contrast of a color with the opaque one under it. */
function contrastOver(color: string, under: string): number {
    const [top, bottom] = [luminanceOver(color, under), luminanceOver(under, under)];
    return (Math.max(top, bottom) + 0.05) / (Math.min(top, bottom) + 0.05);
}

/** The value of a color token, computed where `element` is. */
function tokenColor(element: Element, token: string): string {
    const probe = element.ownerDocument.createElement('span');
    probe.style.backgroundColor = `var(${token})`;
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
}

/** A length token in pixels, computed where `element` is. */
function tokenPixels(element: Element, token: string): number {
    const probe = element.ownerDocument.createElement('span');
    probe.style.position = 'absolute';
    probe.style.height = `var(${token})`;
    element.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
}

const roleField: Field = {
    name: 'role',
    type: 'select',
    label: 'Role',
    options: [
        { value: 'owner', label: 'Owner' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' },
    ],
};

/** Columns and items as a product without a Panneau definition passes them. */
const columns: ListColumn[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', display: 'email' },
    { id: 'role', label: 'Role', field: roleField, display: 'select' },
    { id: 'active', label: 'Active', display: 'boolean', align: 'center' },
    { id: 'joined_on', label: 'Joined', display: 'date', sortable: true },
];

const NAMES = [
    'Ada Lovelace',
    'Grace Hopper',
    'Alan Turing',
    'Katherine Johnson',
    'Edsger Dijkstra',
    'Barbara Liskov',
    'Donald Knuth',
    'Margaret Hamilton',
    'Tim Berners-Lee',
    'Radia Perlman',
    'Ken Thompson',
    'Frances Allen',
    'Dennis Ritchie',
    'Hedy Lamarr',
    'John McCarthy',
    'Shafi Goldwasser',
    'Leslie Lamport',
    'Annie Easley',
    'Niklaus Wirth',
    'Jean Bartik',
    'Linus Torvalds',
    'Sophie Wilson',
    'Guido van Rossum',
    'Mary Kenneth Keller',
    'Bjarne Stroustrup',
];
const ROLES = ['owner', 'editor', 'editor', 'viewer'];

const members: ListItem[] = NAMES.map((name, index) => ({
    id: String(index + 1),
    name,
    email: `${name.split(' ')[0]?.toLowerCase() ?? 'member'}@example.com`,
    role: ROLES[index % ROLES.length],
    active: index % 5 !== 0,
    joined_on: `2026-${String((index % 9) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    // Owners can't be removed.
    abilities: { remove: ROLES[index % ROLES.length] !== 'owner', resend: true },
}));

const actions: Action[] = [
    {
        id: 'edit',
        label: 'Edit',
        kind: 'link',
        url: '#/members/{id}',
        scope: ['item'],
        placement: ['row'],
    },
    {
        id: 'resend',
        label: 'Resend the invitation',
        // A Lucide icon by name, as definitions give it.
        icon: 'mail',
        kind: 'server',
        scope: ['item', 'selection'],
        placement: ['menu', 'toolbar'],
    },
    {
        id: 'remove',
        label: 'Remove',
        kind: 'server',
        scope: ['item', 'selection'],
        placement: ['menu', 'toolbar'],
        destructive: true,
        confirm: {
            title: 'Remove members',
            message: 'Remove {count, plural, one {# member} other {# members}} from the workspace?',
            confirmLabel: 'Remove',
        },
    },
    { id: 'export', label: 'Export', kind: 'server', scope: ['resource'] },
];

const meta = {
    title: 'Lists/List',
    component: List,
    parameters: { layout: 'padded' },
    args: {
        'aria-label': 'Members',
        columns,
        items: members,
        perPage: 10,
        search: true,
        filters: [
            { id: 'role', type: 'select', label: 'Role' },
            { id: 'active', type: 'toggle', label: 'Active only' },
        ],
        layouts: { available: ['table', 'cards'] },
        perPageOptions: [10, 25],
        router: null,
    },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const table = canvas.getByRole('table', { name: 'Members' });
        await expect(within(table).getAllByRole('row')).toHaveLength(11);

        await userEvent.click(canvas.getByRole('button', { name: /Name/ }));
        await expect(canvas.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
            'aria-sort',
            'ascending',
        );
        await expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Ada Lovelace');

        await userEvent.click(canvas.getByRole('button', { name: /Role/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Owner' }));
        await expect(canvas.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Role: Owner',
        );
        await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(
            '1–7 of 7',
        );

        await userEvent.type(canvas.getByRole('searchbox', { name: 'Search' }), 'grace');
        // Grace Hopper is an editor.
        // The empty state, and the status message of the results, which says the same
        await expect(
            await canvas.findByText('No items match the search or the filters.', {
                selector: ':not([role="status"])',
            }),
        ).toBeVisible();
        await userEvent.click(
            canvas.getAllByRole('button', { name: 'Clear all' })[0] as HTMLElement,
        );
        await waitFor(() => expect(canvas.getByRole('navigation')).toHaveTextContent('of 25'));
    },
};

/** A `date-range` filter: its bounds are sent as `filter[joined_on][from]` and `[to]`. */
export const DateRange: Story = {
    args: {
        filters: [{ id: 'joined_on', type: 'date-range', label: 'Joined' }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const range = canvas.getByRole('group', { name: 'Joined' });
        const segments = (name: string) =>
            within(within(range).getByRole('group', { name })).getAllByRole('spinbutton');
        const type = async (name: string, parts: string[]) => {
            for (const [index, part] of parts.entries()) {
                await userEvent.click(segments(name)[index] as HTMLElement);
                await userEvent.keyboard(part);
            }
        };
        await type('To', ['1', '31', '2026']);
        await expect(canvas.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Joined: … – Jan 31, 2026',
        );
        await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(
            '1–3 of 3',
        );
        await type('From', ['1', '15', '2026']);
        await expect(canvas.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
            'Joined: Jan 15, 2026 – Jan 31, 2026',
        );
        await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent(
            '1–1 of 1',
        );
    },
};

/**
 * Every filter control on one line: a select, a switch centered on the line of the controls, and
 * the two ends of a date range side by side, below the labels.
 */
export const FiltersOnOneLine: Story = {
    args: {
        filters: [
            { id: 'role', type: 'select', label: 'Role' },
            { id: 'active', type: 'toggle', label: 'Active only' },
            { id: 'joined_on', type: 'date-range', label: 'Joined' },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const rect = (element: Element | null) => {
            if (element === null) {
                throw new Error('Missing element.');
            }
            return element.getBoundingClientRect();
        };
        const center = (box: DOMRect) => box.top + box.height / 2;
        const select = rect(canvas.getByRole('button', { name: /Role/ }));
        const toggle = rect(canvas.getByRole('switch', { name: 'Active only' }).closest('label'));
        const range = canvas.getByRole('group', { name: 'Joined' });
        const from = rect(within(range).getByRole('group', { name: 'From' }));
        const to = rect(within(range).getByRole('group', { name: 'To' }));
        await expect(Math.abs(center(toggle) - center(select))).toBeLessThan(2);
        await expect(Math.abs(from.top - to.top)).toBeLessThan(1);
        await expect(Math.abs(center(from) - center(select))).toBeLessThan(2);
    },
};

export const Cards: Story = {
    args: { layouts: { available: ['cards', 'table'] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const cards = canvas.getByRole('list', { name: 'Members' });
        await expect(within(cards).getAllByRole('listitem')).toHaveLength(10);
        await userEvent.click(canvas.getByRole('radio', { name: 'Table' }));
        await expect(canvas.getByRole('table', { name: 'Members' })).toBeVisible();
    },
};

/**
 * An item that just appeared, such as one just created (decision 0066): it is scrolled into view,
 * and its background shows it for a moment, then fades (without the fade when the system asks for
 * less motion).
 */
export const HighlightedItem: Story = {
    args: { highlightedItemId: '8', layouts: { available: ['table', 'cards'] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Members' });
        const highlighted = table.querySelectorAll('[data-highlighted]');
        await expect(highlighted).toHaveLength(1);
        await expect(highlighted[0]).toHaveTextContent(members[7]?.name as string);
        await userEvent.click(canvas.getByRole('radio', { name: 'Cards' }));
        const cards = canvas.getByRole('list', { name: 'Members' });
        await expect(cards.querySelector('[data-highlighted]')).toHaveTextContent(
            members[7]?.name as string,
        );
    },
};

/**
 * The "Columns" menu: the name can't be hidden, the email is hidden until the user shows it, and
 * the others can be hidden and moved (decision 0042).
 */
export const ChooseColumns: Story = {
    args: {
        columns: columns.map((column) =>
            column.id === 'name'
                ? { ...column, hideable: false }
                : column.id === 'email'
                  ? { ...column, hidden: true }
                  : column,
        ),
        search: false,
        filters: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const headers = () =>
            canvas
                .getAllByRole('columnheader', { hidden: true })
                .map((header) => header.textContent);
        await expect(headers()).toEqual(['Name', 'Role', 'Active', 'Joined']);

        await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
        const menu = await body.findByRole('dialog', { name: 'Columns' });
        await expect(within(menu).getByRole('checkbox', { name: 'Name' })).toBeDisabled();
        await userEvent.click(within(menu).getByRole('checkbox', { name: 'Email' }));
        await userEvent.click(within(menu).getByRole('checkbox', { name: 'Active' }));
        await userEvent.click(within(menu).getByRole('button', { name: 'Move Email up' }));
        await expect(headers()).toEqual(['Name', 'Role', 'Email', 'Joined']);
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(canvas.getByRole('button', { name: 'Columns' })).toHaveFocus());
    },
};

/** An image for each member, drawn in place: stories don't fetch images. */
function portrait(index: number): string {
    const hue = (index * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="hsl(${String(hue)} 60% 70%)"/><circle cx="2" cy="1.3" r="0.7" fill="hsl(${String(hue)} 40% 40%)"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The gallery, on the `itemImage` of the items (decision 0044). Some members have no photo. */
export const Gallery: Story = {
    args: {
        layouts: { available: ['gallery', 'table'] },
        itemImage: 'photo',
        items: members.map((member, index) => ({
            ...member,
            photo: index % 4 === 3 ? null : { media: { thumbnailUrl: portrait(index) } },
        })),
        actions: { available: actions },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const gallery = canvas.getByRole('list', { name: 'Members' });
        await expect(within(gallery).getAllByRole('listitem')).toHaveLength(10);
        await expect(gallery.querySelectorAll('img')).toHaveLength(8);
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
        await expect(canvas.getByText('1 item selected')).toBeVisible();
    },
};

/**
 * The table of a resource with an `itemImage`: each title starts with a square thumbnail, or a
 * placeholder for the members without a photo (decision 0061).
 */
export const TableWithThumbnails: Story = {
    args: { ...Gallery.args, layouts: { available: ['table', 'gallery'] } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Members' });
        const images = table.querySelectorAll('img');
        await expect(images).toHaveLength(8);
        await expect(images[0]).toHaveAttribute('alt', '');
        await expect(images[0]).toHaveAttribute('loading', 'lazy');
        const fourth = within(table).getAllByRole('row')[4] as HTMLElement;
        await expect(fourth.querySelector('img')).toBeNull();
        await expect(within(fourth).getByText('Katherine Johnson')).toBeVisible();
    },
};

/** On a phone, the thumbnail stays before the title of each block. */
export const TableWithThumbnailsOnAPhone: Story = {
    ...TableWithThumbnails,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Members' });
        await expect(table.querySelectorAll('img')).toHaveLength(8);
        await expect(
            within(table).getAllByRole('columnheader', { hidden: true })[0],
        ).not.toBeVisible();
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
};

/**
 * The calendar: the members on the day they joined, in March (decision 0044). It asks for the
 * days around the month through the `joined_on` filter, and moves from month to month.
 */
export const Calendar: Story = {
    args: {
        layouts: { available: ['calendar', 'table'] },
        calendar: { field: 'joined_on', filter: 'joined_on' },
        filters: [{ id: 'role', type: 'select', label: 'Role' }],
        router: createMemoryRouter('month=2026-03'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The calendar's code loads when it shows
        const grid = await canvas.findByRole('table', { name: 'Members, March 2026' });
        await expect(grid).toHaveTextContent('Alan Turing');
        await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
        await expect(
            await canvas.findByRole('table', { name: 'Members, April 2026' }),
        ).toHaveTextContent('Katherine Johnson');
        await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
        await expect(canvas.getByRole('table', { name: 'Members, March 2026' })).toBeVisible();
    },
};

/**
 * The state of each item in the calendar (#413): a dot in the tone of its option, as the badges of
 * the table show it, here the role of members (`itemStatus`), and the whole title on hover.
 */
export const CalendarWithStates: Story = {
    args: {
        ...Calendar.args,
        router: createMemoryRouter('month=2026-03'),
        itemStatus: 'role',
        fields: [
            {
                ...roleField,
                options: [
                    { value: 'owner', label: 'Owner', tone: 'accent' },
                    { value: 'editor', label: 'Editor', tone: 'success' },
                    { value: 'viewer', label: 'Viewer', tone: 'neutral' },
                ],
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const grid = await canvas.findByRole('table', { name: 'Members, March 2026' });
        const item = (name: string) =>
            within(grid)
                .getAllByRole('listitem')
                .find((element) => element.title === name) as HTMLElement;
        const dot = (name: string) => item(name).querySelector('.panneau-badge') as HTMLElement;
        await expect(item('Linus Torvalds')).toHaveTextContent('OwnerLinus Torvalds');
        await expect(item('Alan Turing')).toHaveTextContent('EditorAlan Turing');
        await expect(dot('Linus Torvalds')).toBeVisible();
        // Each state in the solid color of its tone
        const color = (name: string) => getComputedStyle(dot(name)).backgroundColor;
        await expect(color('Linus Torvalds')).not.toBe(color('Alan Turing'));
        await expect(color('Alan Turing')).not.toBe(color('Frances Allen'));
    },
};

/**
 * A month without items says so where its grid would be (#413), and keeps its buttons to the
 * other months.
 */
export const CalendarEmptyMonth: Story = {
    args: { ...Calendar.args, router: createMemoryRouter('month=2026-10') },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('No items in October 2026')).toBeVisible();
        await expect(canvas.queryByRole('table')).toBeNull();
        await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
        await expect(
            await canvas.findByRole('table', { name: 'Members, September 2026' }),
        ).toBeVisible();
    },
};

/** On a phone, the calendar lists the days that have items. */
export const CalendarOnAPhone: Story = {
    ...Calendar,
    args: { ...Calendar.args, router: createMemoryRouter('month=2026-03') },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The calendar's code loads when it shows
        const grid = await canvas.findByRole('table', { name: 'Members, March 2026' });
        const headers = within(grid).getAllByRole('columnheader', { hidden: true });
        await expect(headers[0]).not.toBeVisible();
        await expect(within(grid).getAllByRole('listitem')[0]).toBeVisible();
    },
};

/**
 * Columns that edit their field in place (decision 0043): a text, a select, a boolean and a date.
 * Each change is saved alone, here after a short wait; the name can't be empty.
 */
export const EditInPlace: Story = {
    args: {
        columns: [
            {
                id: 'name',
                label: 'Name',
                sortable: true,
                field: { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
            },
            { id: 'role', label: 'Role', field: roleField, display: 'select' },
            {
                id: 'active',
                label: 'Active',
                field: { name: 'active', type: 'boolean', label: 'Active' },
                display: 'boolean',
            },
            {
                id: 'joined_on',
                label: 'Joined',
                field: { name: 'joined_on', type: 'date', label: 'Joined' },
                display: 'date',
            },
        ],
        items: members.map((member) => ({
            ...member,
            abilities: { ...member.abilities, update: true },
        })),
        inline: {
            fields: ['name', 'role', 'active', 'joined_on'],
            onEdit: fn(
                ({ item, field, value }: { item: ListItem; field: Field; value: unknown }) =>
                    new Promise<ListItem>((resolve) => {
                        setTimeout(() => resolve({ ...item, [field.name]: value }), 300);
                    }),
            ),
        },
        search: false,
        filters: [],
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Edit Name of Ada Lovelace' }));
        const input = canvas.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(input);
        await userEvent.keyboard('{Enter}');
        await expect(canvas.getByText('This field is required.')).toBeVisible();
        await userEvent.type(input, 'Ada King{Enter}');
        await expect(canvas.getByRole('progressbar', { name: 'Saving…' })).toBeInTheDocument();
        await expect(
            await canvas.findByRole('button', { name: 'Edit Name of Ada King' }),
        ).toHaveFocus();
        await expect(args.inline?.onEdit).toHaveBeenCalledTimes(1);
    },
};

/**
 * On a phone (#406): the search and the "Filters" button, then one row of controls, with the sort
 * and the actions of the list in a menu, so that the first items show on the first screen. The
 * table shows each row as a card, with the labels of its values: the layout switch leaves out the
 * cards, and here has no other layout.
 */
export const OnAPhone: Story = {
    args: { actions: { available: actions, onRun: fn() } },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const table = canvas.getByRole('table', { name: 'Members' });
        // The headers are replaced by the labels of the values
        await expect(table.querySelector('thead')).not.toBeVisible();
        await expect(canvas.queryByRole('radiogroup', { name: 'Layout' })).toBeNull();
        const select = canvas.getByRole('button', { name: 'Select' });
        // The menu's code loads on phones only: its button, once it is there
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'More options' })).toHaveAttribute(
                'aria-haspopup',
            ),
        );
        const more = canvas.getByRole('button', { name: 'More options' });
        await expect(more.getBoundingClientRect().top).toBe(select.getBoundingClientRect().top);
        await expect(canvas.queryByRole('button', { name: 'Export' })).toBeNull();
        // Two rows of controls, then the first item
        const search = canvas.getByRole('searchbox', { name: 'Search' });
        await expect(select.getBoundingClientRect().top).toBeGreaterThan(
            search.getBoundingClientRect().top,
        );
        await expect(
            table.getBoundingClientRect().top - search.getBoundingClientRect().top,
        ).toBeLessThan(160);

        await userEvent.click(more);
        const menu = await body.findByRole('menu', { name: 'More options' });
        await userEvent.click(
            within(menu).getByRole('menuitemradio', { name: 'Name, descending' }),
        );
        await waitFor(() =>
            // The row of the headers is hidden: the first row is the first item
            expect(within(table).getAllByRole('row')[0]).toHaveTextContent('Tim Berners-Lee'),
        );
        await userEvent.click(more);
        await userEvent.click(await body.findByRole('menuitem', { name: 'Export' }));
        await expect(args.actions?.onRun).toHaveBeenCalledWith(
            expect.objectContaining({ scope: 'resource' }),
        );
    },
};

/**
 * The toolbar stays in place (#412): the layout switch doesn't move when the layout or the
 * selection changes. Each layout shows only the controls that change it: the calendar has no
 * sort, no columns and no "Select". "Columns" and "Select" are icon buttons, named by their
 * tooltips (#424); "Done" keeps its label.
 */
export const ToolbarInPlace: Story = {
    args: {
        layouts: { available: ['table', 'cards', 'calendar'] },
        calendar: { field: 'joined_on', filter: 'joined_on' },
        actions: { available: actions, onRun: fn() },
        router: createMemoryRouter('month=2026-03'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const layoutSwitch = canvas.getByRole('radiogroup', { name: 'Layout' });
        const place = () => {
            const { top, right } = layoutSwitch.getBoundingClientRect();
            return { top: Math.round(top), right: Math.round(right) };
        };
        const start = place();
        const columnsButton = canvas.getByRole('button', { name: 'Columns' });
        await userEvent.hover(columnsButton);
        await expect(await body.findByRole('tooltip')).toHaveTextContent('Columns');
        await userEvent.unhover(columnsButton);

        await userEvent.click(canvas.getByRole('radio', { name: 'Cards' }));
        await expect(place()).toEqual(start);
        await expect(canvas.getByRole('button', { name: 'Sort by' })).toBeVisible();

        await userEvent.click(canvas.getByRole('radio', { name: 'Calendar' }));
        await canvas.findByRole('table', { name: 'Members, March 2026' });
        await expect(place()).toEqual(start);
        await expect(canvas.queryByRole('button', { name: 'Sort by' })).toBeNull();
        await expect(canvas.queryByRole('button', { name: 'Columns' })).toBeNull();
        await expect(canvas.queryByRole('button', { name: 'Select' })).toBeNull();

        await userEvent.click(canvas.getByRole('radio', { name: 'Table' }));
        const select = canvas.getByRole('button', { name: 'Select' });
        await userEvent.click(select);
        await expect(canvas.getByRole('button', { name: 'Done' })).toHaveTextContent('Done');
        await expect(canvas.getByRole('button', { name: 'Done' })).toHaveFocus();
        await expect(place()).toEqual(start);
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
        await expect(place()).toEqual(start);
        await userEvent.click(canvas.getByRole('button', { name: 'Done' }));

        // The sort says its column, and its direction in its name
        await userEvent.click(canvas.getByRole('button', { name: 'Sort by' }));
        await userEvent.click(
            await body.findByRole('menuitemradio', { name: 'Joined, descending' }),
        );
        await expect(
            canvas.getByRole('button', { name: 'Sort by: Joined, descending' }),
        ).toHaveTextContent('Joined');
        await expect(place()).toEqual(start);
    },
};

/** The action of a row: its button, or the item of its menu, which it opens. */
async function findRowAction(
    canvasElement: HTMLElement,
    label: string,
    item: string,
): Promise<HTMLElement> {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const button = canvas.queryByRole('button', { name: `${label}: ${item}` });
    if (button !== null) {
        return button;
    }
    const entry = body.queryByRole('menuitem', { name: label });
    if (entry !== null) {
        return entry;
    }
    await userEvent.click(canvas.getByRole('button', { name: `Actions for ${item}` }));
    return body.findByRole('menuitem', { name: label });
}

export const SelectionAndActions: Story = {
    args: {
        actions: {
            available: actions,
            // An icon component, for an action written in code.
            icons: { remove: UserMinus },
            onRun: fn(),
        },
        getItemHref: (item: ListItem) => `#/members/${item.id}`,
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Select every item of the page' }),
        );
        await expect(canvas.getByText('10 items selected')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Select all 25 items' }));
        await expect(canvas.getByText('All 25 items are selected, on every page.')).toBeVisible();
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Ada Lovelace' }));

        await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
        const dialog = await body.findByRole('alertdialog', { name: 'Remove members' });
        await expect(dialog).toHaveTextContent('Remove 24 members from the workspace?');
        // Two owners are on the page: they can't be removed.
        await expect(dialog).toHaveTextContent(
            '2 selected items don’t allow it and will be skipped.',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));
        await waitFor(() =>
            expect(args.actions?.onRun).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: 'selection',
                    count: 24,
                    selection: { query: {}, except: ['1'] },
                }),
            ),
        );
        await waitFor(() => expect(canvas.queryByText(/selected/)).not.toBeInTheDocument());

        // A button of the row, or an item of its menu when they don't fit (decision 0060)
        const resend = await findRowAction(canvasElement, 'Resend the invitation', 'Grace Hopper');
        // A named icon loads on demand: give it time on a busy machine.
        await waitFor(() => expect(resend.querySelector('svg')).toHaveClass('lucide-mail'), {
            timeout: 5000,
        });
        await expect(
            (await findRowAction(canvasElement, 'Remove', 'Grace Hopper')).querySelector('svg'),
        ).toHaveClass('lucide-user-minus');
        await userEvent.click(resend);
        await expect(args.actions?.onRun).toHaveBeenLastCalledWith(
            expect.objectContaining({ scope: 'item', count: 1 }),
        );
    },
};

/**
 * The built-in links `show` and `edit` as a backend declares them, without a URL or a label: the
 * caller resolves them to its routes (`getLinkHref`), and the list labels them in its locale.
 * Owners can't be updated: they have no "Edit".
 */
export const BuiltInLinks: Story = {
    args: {
        items: members.map((member) => ({
            ...member,
            abilities: { ...member.abilities, view: true, update: member.role !== 'owner' },
        })),
        actions: {
            available: [
                { id: 'show', kind: 'link', scope: ['item'] },
                { id: 'edit', kind: 'link', scope: ['item'] },
            ],
        },
        getLinkHref: (action: Action, item: ListItem) =>
            action.id === 'edit' ? `#/members/${item.id}/edit` : `#/members/${item.id}`,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(edit).toHaveAttribute('href', '#/members/2/edit');
        // An icon, and `show`, the main action, with its label (decision 0060)
        await expect(edit).toHaveTextContent('');
        await expect(edit.querySelector('svg')).toHaveClass('lucide-pencil');
        await expect(canvas.getByRole('link', { name: 'View: Grace Hopper' })).toHaveTextContent(
            'View',
        );
        await expect(canvas.getByRole('link', { name: 'View: Grace Hopper' })).toHaveAttribute(
            'href',
            '#/members/2',
        );
        // Ada Lovelace is an owner
        await expect(canvas.queryByRole('link', { name: 'Edit: Ada Lovelace' })).toBeNull();
        await expect(canvas.getByRole('link', { name: 'View: Ada Lovelace' })).toBeVisible();
    },
};

/** Members whose built-in actions are allowed, but `delete` on owners. */
const builtInMembers: ListItem[] = members.map((member) => ({
    ...member,
    abilities: {
        ...member.abilities,
        view: true,
        update: true,
        duplicate: true,
        delete: member.role !== 'owner',
    },
}));

/** The built-in item actions as a backend declares them: `duplicate` and `delete` in `menu`. */
const builtInActions: Action[] = [
    { id: 'show', kind: 'link', scope: ['item'] },
    { id: 'edit', kind: 'link', scope: ['item'] },
    { id: 'duplicate', kind: 'server', scope: ['item'], placement: ['menu'] },
    {
        id: 'delete',
        kind: 'server',
        scope: ['item'],
        placement: ['menu'],
        destructive: true,
        confirm: true,
    },
];

const getLinkHref = (action: Action, item: ListItem) =>
    action.id === 'edit' ? `#/members/${item.id}/edit` : `#/members/${item.id}`;

/** The buttons and links of the actions of a row, and its menu button. */
function rowActions(canvasElement: HTMLElement, item: string): HTMLElement[] {
    const row = within(canvasElement).getByText(item, { selector: 'td *' }).closest('tr');
    const actions = row?.querySelector('[data-row-actions]');
    return actions !== null && actions !== undefined
        ? [...actions.querySelectorAll<HTMLElement>('a, button')]
        : [];
}

/** Checks the rule of decision 0060 on a row: a menu holds two actions or more. */
async function expectMenuOfTwoOrMore(canvasElement: HTMLElement, item: string) {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const menu = canvas.queryByRole('button', { name: `Actions for ${item}` });
    if (menu === null) {
        return 0;
    }
    await userEvent.click(menu);
    const entries = await body.findAllByRole('menuitem');
    await expect(entries.length).toBeGreaterThanOrEqual(2);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    return entries.length;
}

/**
 * The built-in actions of rows (decision 0060): their icons, in their colors, with their labels as
 * names and tooltips, and the main action, `show`, with its label. `delete` is last, red, and asks
 * first. No menu: the icons fit. Owners can't be deleted: their rows keep the place.
 */
export const RowActions: Story = {
    args: {
        columns: columns.filter((column) => column.id === 'name' || column.id === 'role'),
        items: builtInMembers,
        actions: { available: builtInActions, onRun: fn() },
        getLinkHref,
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.queryByRole('button', { name: /^Actions for/ })).toBeNull();
        const view = canvas.getByRole('link', { name: 'View: Grace Hopper' });
        await expect(view).toHaveTextContent('View');
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(edit).toHaveTextContent('');
        const duplicate = canvas.getByRole('button', { name: 'Duplicate: Grace Hopper' });
        await expect(duplicate).toHaveTextContent('');
        const remove = canvas.getByRole('button', { name: 'Delete: Grace Hopper' });
        await expect(remove).toHaveTextContent('');
        // Each in its color
        await expect(getComputedStyle(remove).color).not.toBe(getComputedStyle(duplicate).color);
        await expect(getComputedStyle(view).color).not.toBe(getComputedStyle(duplicate).color);
        // The same place on every row
        await expect(
            canvas.getByRole('link', { name: 'Edit: Ada Lovelace' }).getBoundingClientRect().left,
        ).toBe(edit.getBoundingClientRect().left);
        await expect(rowActions(canvasElement, 'Grace Hopper').at(-1)).toBe(remove);
        // Ada Lovelace is an owner
        await expect(canvas.queryByRole('button', { name: 'Delete: Ada Lovelace' })).toBeNull();

        // The link shows its hover
        const idle = await settledBackground(edit);
        await userEvent.hover(edit);
        await waitFor(() => expect(edit).toHaveAttribute('data-hovered'));
        await expect(await settledBackground(edit)).not.toBe(idle);
        await userEvent.unhover(edit);

        // The background is the link's own, so it paints its whole box, and that box is the area
        // that takes the pointer: nothing inside paints another background, and points just
        // inside each of its edges hit the link.
        for (const child of edit.querySelectorAll('*')) {
            await expect(getComputedStyle(child).backgroundColor).toBe('rgba(0, 0, 0, 0)');
        }
        const box = edit.getBoundingClientRect();
        const middle = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        for (const [x, y] of [
            [box.left + 1, middle.y],
            [box.right - 1, middle.y],
            [middle.x, box.top + 1],
            [middle.x, box.bottom - 1],
        ] as const) {
            const hit = edit.ownerDocument.elementFromPoint(x, y);
            await expect(hit !== null && edit.contains(hit)).toBe(true);
        }

        // The same height and corners, aligned, with room between them
        const link = edit.getBoundingClientRect();
        const next = duplicate.getBoundingClientRect();
        await expect(link.height).toBe(next.height);
        await expect(link.top).toBe(next.top);
        await expect(getComputedStyle(edit).borderRadius).toBe(
            getComputedStyle(duplicate).borderRadius,
        );
        // `--panneau-space-2`
        await expect(next.left - link.right).toBeGreaterThanOrEqual(8);

        // `delete` asks first, as it did from the menu
        await userEvent.click(remove);
        const dialog = await body.findByRole('alertdialog');
        await expect(args.actions?.onRun).not.toHaveBeenCalled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
        await waitFor(() =>
            expect(args.actions?.onRun).toHaveBeenCalledWith(
                expect.objectContaining({ scope: 'item', count: 1 }),
            ),
        );
    },
};

const BIOS = [
    'Wrote the first program for a machine that had not been built yet, and saw that it could do more than arithmetic.',
    'Built one of the first compilers, and spent years convincing people that programs could be written in words.',
    'Asked whether machines can think, and broke codes during the war with machines of his own design.',
];

/**
 * Rows whose content needs the room: the same actions as in any list of the admin, icons and the
 * labelled main action, and no menu, which only takes actions when the icons don't fit.
 */
export const RowActionsWithLongContent: Story = {
    args: {
        ...RowActions.args,
        columns: [
            { id: 'name', label: 'Name' },
            { id: 'bio', label: 'Biography' },
            { id: 'role', label: 'Role', field: roleField, display: 'select' },
        ],
        items: builtInMembers.map((member, index) => ({
            ...member,
            bio: BIOS[index % BIOS.length],
        })),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(edit).toHaveTextContent('');
        await expect(edit.querySelector('svg')).toHaveClass('lucide-pencil');
        await expect(canvas.getByRole('link', { name: 'View: Grace Hopper' })).toHaveTextContent(
            'View',
        );
        const remove = canvas.getByRole('button', { name: 'Delete: Grace Hopper' });
        await expect(remove).toHaveTextContent('');
        await expect(remove.querySelector('svg')).toHaveClass('lucide-trash-2');
        await expect(canvas.queryByRole('button', { name: /^Actions for/ })).toBeNull();
        // Square, as high as they are wide
        const { width, height } = remove.getBoundingClientRect();
        await expect(width).toBe(height);
    },
};

/** Actions a product declares on its rows, after the built-in ones. */
const declaredActions: Action[] = [
    {
        id: 'resend',
        label: 'Resend the invitation',
        icon: 'mail',
        kind: 'server',
        scope: ['item'],
    },
    {
        id: 'invoices',
        label: 'Invoices',
        icon: 'receipt',
        kind: 'link',
        url: '#/members/{id}/invoices',
        scope: ['item'],
    },
    {
        id: 'impersonate',
        label: 'Sign in as',
        icon: 'log-in',
        kind: 'server',
        scope: ['item'],
        placement: ['menu'],
    },
    {
        id: 'export',
        label: 'Export the data',
        icon: 'download',
        kind: 'server',
        scope: ['item'],
        placement: ['menu'],
    },
    {
        id: 'suspend',
        label: 'Suspend',
        icon: 'ban',
        kind: 'server',
        scope: ['item'],
        placement: ['menu'],
        destructive: true,
    },
];

/**
 * Many actions on each row: the icons alone would crowd it, so the last ones go to a menu, the
 * same on every row so the columns line up. The menu never holds a single action.
 */
export const ManyRowActions: Story = {
    args: {
        ...RowActions.args,
        columns,
        items: builtInMembers.map((member) => ({
            ...member,
            abilities: {
                ...member.abilities,
                resend: true,
                invoices: true,
                impersonate: true,
                export: true,
                suspend: true,
            },
        })),
        actions: { available: [...builtInActions, ...declaredActions] },
    },
    decorators: [
        (Story) => (
            <div style={{ width: 900 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const menu = await canvas.findByRole('button', { name: 'Actions for Grace Hopper' });
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(edit).toHaveTextContent('');
        // The same actions out of the menu on rows that allow the same ones
        const shown = (item: string) =>
            rowActions(canvasElement, item).map((action) => action.getAttribute('aria-label'));
        await expect(shown('Grace Hopper').length).toBe(shown('Alan Turing').length);
        await expect(await expectMenuOfTwoOrMore(canvasElement, 'Grace Hopper')).toBeGreaterThan(1);

        // The icon link and the menu button: the same height and corners, aligned
        const link = edit.getBoundingClientRect();
        const button = menu.getBoundingClientRect();
        await expect(link.height).toBe(button.height);
        await expect(link.width).toBe(button.width);
        await expect(link.top).toBe(button.top);
        await expect(getComputedStyle(edit).borderRadius).toBe(getComputedStyle(menu).borderRadius);
    },
};

/** A list narrower than its table needs: the actions give up their room before it scrolls. */
export const RowActionsInANarrowList: Story = {
    args: {
        ...ManyRowActions.args,
        actions: { available: [...builtInActions, ...declaredActions.slice(0, 2)] },
    },
    decorators: [
        (Story) => (
            <div style={{ width: 680 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Members' });
        const scroller = table.parentElement as HTMLElement;
        await waitFor(() =>
            expect(canvas.getByRole('link', { name: 'Edit: Grace Hopper' })).toHaveTextContent(''),
        );
        await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
        await expectMenuOfTwoOrMore(canvasElement, 'Grace Hopper');
    },
};

/**
 * The actions of rows on a phone: on one line in each item, and a menu for those that don't fit
 * beside them.
 */
export const RowActionsOnAPhone: Story = {
    args: {
        ...RowActions.args,
        actions: { available: [...builtInActions, ...declaredActions.slice(0, 2)] },
        items: ManyRowActions.args?.items ?? builtInMembers,
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Members' });
        const right = table.getBoundingClientRect().right;
        const actions = rowActions(canvasElement, 'Grace Hopper');
        const top = actions[0]?.getBoundingClientRect().top;
        for (const action of actions) {
            await expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(right);
            await expect(action.getBoundingClientRect().top).toBe(top);
        }
        await expect(await expectMenuOfTwoOrMore(canvasElement, 'Grace Hopper')).toBeGreaterThan(1);
    },
};

export const Empty: Story = {
    args: {
        items: [],
        emptyMessage: 'Nobody has joined the workspace yet.',
        toolbar: <Button tone="accent">Invite</Button>,
    },
};

/**
 * A long list under a bar that sticks to the top of the window, as the app's on a small screen
 * (`--panneau-frame-top`): the selection bar sticks under it, and the header of the table under the
 * selection bar, while the page scrolls (#443).
 */
export const StickyHeaderAndSelection: Story = {
    args: {
        perPage: 25,
        perPageOptions: [25],
        actions: { available: actions, onRun: fn() },
    },
    decorators: [
        (Story) => (
            <div style={{ '--panneau-frame-top': '3rem' } as CSSProperties}>
                <div
                    data-testid="frame-top"
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        height: '3rem',
                        background: 'var(--panneau-color-surface-sunken)',
                    }}
                />
                <Story />
                <div style={{ height: '50vh' }} />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const scroller = canvasElement.ownerDocument.scrollingElement as HTMLElement;
        const table = canvas.getByRole('table', { name: 'Members' });
        const header = within(table).getAllByRole('columnheader')[0] as HTMLElement;
        await expect(getComputedStyle(header).position).toBe('sticky');
        const frameTop = tokenPixels(table, '--panneau-frame-top');
        await expect(frameTop).toBeGreaterThan(0);

        // Scrolled past the top of the table, its header sticks under the frame
        scroller.scrollTop += table.getBoundingClientRect().top + 400;
        await waitFor(() =>
            expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(frameTop)),
        );
        scroller.scrollTop = 0;

        // With a selection, the bar sticks under the frame, and the header under the bar
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Grace Hopper' }));
        const bar = canvas.getByText('1 item selected').parentElement as HTMLElement;
        scroller.scrollTop += table.getBoundingClientRect().top + 400;
        await waitFor(() =>
            expect(Math.round(bar.getBoundingClientRect().top)).toBe(Math.round(frameTop)),
        );
        await waitFor(() =>
            expect(Math.round(header.getBoundingClientRect().top)).toBe(
                Math.round(bar.getBoundingClientRect().bottom),
            ),
        );
        // Its actions are still at hand
        await expect(canvas.getByRole('button', { name: 'Remove' })).toBeVisible();
        // Nothing of the list goes over the frame
        const frame = canvas.getByTestId('frame-top');
        const { left, bottom } = frame.getBoundingClientRect();
        await expect(canvasElement.ownerDocument.elementFromPoint(left + 10, bottom - 2)).toBe(
            frame,
        );
        scroller.scrollTop = 0;
    },
};

/** On a phone, rows are cards, without a header: the selection bar still sticks (#443). */
export const StickySelectionOnAPhone: Story = {
    ...StickyHeaderAndSelection,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
                <div style={{ height: '50vh' }} />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const scroller = canvasElement.ownerDocument.scrollingElement as HTMLElement;
        const table = canvas.getByRole('table', { name: 'Members' });
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Grace Hopper' }));
        const bar = canvas.getByText('1 item selected').parentElement as HTMLElement;
        scroller.scrollTop += table.getBoundingClientRect().top + 600;
        const frameTop = tokenPixels(table, '--panneau-frame-top');
        await waitFor(() =>
            expect(Math.round(bar.getBoundingClientRect().top)).toBe(Math.round(frameTop)),
        );
        await expect(canvas.getByRole('button', { name: 'Remove' })).toBeVisible();
        scroller.scrollTop = 0;
    },
};

const navigate = fn();

/**
 * A click on a row, outside its controls, opens its item as its title does; in select mode, it
 * selects it. The title stays the only link of the row (#443).
 */
export const RowsOpenTheirItem: Story = {
    args: {
        actions: { available: actions, onRun: fn() },
        getItemHref: (item: ListItem) => `#/members/${item.id}`,
    },
    decorators: [
        (Story) => (
            <RouterProvider navigate={navigate}>
                <Story />
            </RouterProvider>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        navigate.mockClear();
        const row = canvas.getByRole('link', { name: 'Grace Hopper' }).closest('tr') as HTMLElement;
        await expect(getComputedStyle(row).cursor).toBe('pointer');
        // Not a link, nor a tab stop, itself
        await expect(row).not.toHaveAttribute('role');
        await expect(row).not.toHaveAttribute('tabindex');
        await userEvent.click(within(row).getByText('Editor'));
        await expect(navigate).toHaveBeenCalledTimes(1);
        await expect(navigate.mock.calls[0]?.[0]).toBe('#/members/2');

        // Its actions stay its own
        navigate.mockClear();
        await userEvent.click(
            await findRowAction(canvasElement, 'Resend the invitation', 'Grace Hopper'),
        );
        await expect(navigate).not.toHaveBeenCalled();

        // In select mode, a click selects
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(within(row).getByText('Editor'));
        await expect(canvas.getByRole('checkbox', { name: 'Select Grace Hopper' })).toBeChecked();
        await expect(navigate).not.toHaveBeenCalled();
    },
};

/**
 * A selected row reads darker than a hovered one, in both schemes and every theme (#405): its
 * color is further from the surface than the hover color.
 */
export const SelectedRows: Story = {
    args: {
        actions: { available: actions, onRun: fn() },
        getItemHref: (item: ListItem) => `#/members/${item.id}`,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Select' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Grace Hopper' }));
        const table = canvas.getByRole('table', { name: 'Members' });
        const row = canvas.getByRole('link', { name: 'Grace Hopper' }).closest('tr') as HTMLElement;
        const surface = tokenColor(table, '--panneau-color-surface');
        const hover = tokenColor(table, '--panneau-color-hover');
        const selected = getComputedStyle(row).backgroundColor;
        await expect(contrastOver(selected, surface)).toBeGreaterThan(
            contrastOver(hover, surface) * 1.05,
        );
    },
};

/** An empty list with an action to create its first item (#443). */
export const EmptyWithAnAction: Story = {
    args: {
        items: [],
        emptyMessage: 'Nobody has joined the workspace yet.',
        emptyAction: { label: 'Invite a member', href: '#/members/invite' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Invite a member' })).toHaveAttribute(
            'href',
            '#/members/invite',
        );
        // Emptied by a search, the list offers to clear it instead
        await userEvent.type(canvas.getByRole('searchbox', { name: 'Search' }), 'grace');
        await waitFor(() =>
            expect(canvas.queryByRole('link', { name: 'Invite a member' })).toBeNull(),
        );
        await expect(canvas.getAllByRole('button', { name: 'Clear all' })[0]).toBeVisible();
    },
};

const loadingList = createList({ defaults: { perPage: 5 } });

/** The first page loads: rows of the columns, as many as the page size, announced once. */
export const Loading: StoryObj<typeof ListView> = {
    render: () => (
        <ListView list={loadingList} columns={columns} items={undefined} aria-label="Members" />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading the items…');
        const region = canvasElement.querySelector('[aria-busy="true"]');
        await expect(region?.querySelectorAll('tbody tr')).toHaveLength(5);
        await expect(region?.querySelectorAll('th')).toHaveLength(columns.length);
        // The skeleton is inert: its sort buttons can't be used before the items are there.
        await expect(region?.querySelector('[inert]')).not.toBeNull();
    },
};

/** The first page loads in the cards layout: cards of the columns. */
export const LoadingCards: StoryObj<typeof ListView> = {
    render: () => (
        <ListView
            list={loadingList}
            columns={columns}
            items={undefined}
            layouts={{
                current: 'cards',
            }}
        />
    ),
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('status')).toBeInTheDocument();
        await expect(
            canvasElement.querySelectorAll('[aria-busy="true"] li .panneau-skeleton'),
        ).toHaveLength(5 * columns.length);
    },
};

export const LoadError: StoryObj<typeof ListView> = {
    render: () => (
        <ListView
            list={loadingList}
            columns={columns}
            items={undefined}
            error={new Error('The server didn’t answer.')}
            onRetry={() => undefined}
        />
    ),
};
