import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMinus } from 'lucide-react';
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
        layouts: ['table', 'cards'],
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
        await expect(
            await canvas.findByText('No items match the search or the filters.'),
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
    args: { layouts: ['cards', 'table'] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const cards = canvas.getByRole('list', { name: 'Members' });
        await expect(within(cards).getAllByRole('listitem')).toHaveLength(10);
        await userEvent.click(canvas.getByRole('radio', { name: 'Table' }));
        await expect(canvas.getByRole('table', { name: 'Members' })).toBeVisible();
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
        layouts: ['gallery', 'table'],
        itemImage: 'photo',
        items: members.map((member, index) => ({
            ...member,
            photo: index % 4 === 3 ? null : { media: { thumbnailUrl: portrait(index) } },
        })),
        actions,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const gallery = canvas.getByRole('list', { name: 'Members' });
        await expect(within(gallery).getAllByRole('listitem')).toHaveLength(10);
        await expect(gallery.querySelectorAll('img')).toHaveLength(8);
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
        await expect(canvas.getByText('1 item selected')).toBeVisible();
    },
};

/**
 * The calendar: the members on the day they joined, in March (decision 0044). It asks for the
 * days around the month through the `joined_on` filter, and moves from month to month.
 */
export const Calendar: Story = {
    args: {
        layouts: ['calendar', 'table'],
        calendar: { field: 'joined_on', filter: 'joined_on' },
        filters: [{ id: 'role', type: 'select', label: 'Role' }],
        router: createMemoryRouter('month=2026-03'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const grid = canvas.getByRole('table', { name: 'Members, March 2026' });
        await expect(grid).toHaveTextContent('Alan Turing');
        await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
        await expect(
            await canvas.findByRole('table', { name: 'Members, April 2026' }),
        ).toHaveTextContent('Katherine Johnson');
        await userEvent.click(canvas.getByRole('button', { name: 'Previous month' }));
        await expect(canvas.getByRole('table', { name: 'Members, March 2026' })).toBeVisible();
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
        const grid = canvas.getByRole('table', { name: 'Members, March 2026' });
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
        inlineEdit: ['name', 'role', 'active', 'joined_on'],
        onInlineEdit: fn(
            ({ item, field, value }: { item: ListItem; field: Field; value: unknown }) =>
                new Promise<ListItem>((resolve) => {
                    setTimeout(() => resolve({ ...item, [field.name]: value }), 300);
                }),
        ),
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
        await expect(args.onInlineEdit).toHaveBeenCalledTimes(1);
    },
};

export const OnAPhone: Story = {
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The headers are replaced by the labels of the values, and by the sort select.
        await expect(
            canvas.getByRole('table', { name: 'Members' }).querySelector('thead'),
        ).not.toBeVisible();
        await expect(canvas.getByRole('button', { name: /Sort by/ })).toBeVisible();
    },
};

export const SelectionAndActions: Story = {
    args: {
        actions,
        // An icon component, for an action written in code.
        actionIcons: { remove: UserMinus },
        onAction: fn(),
        getItemHref: (item: ListItem) => `#/members/${item.id}`,
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
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
            expect(args.onAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    scope: 'selection',
                    count: 24,
                    selection: { query: {}, except: ['1'] },
                }),
            ),
        );
        await waitFor(() => expect(canvas.queryByText(/selected/)).not.toBeInTheDocument());

        await userEvent.click(canvas.getByRole('button', { name: 'Actions for Grace Hopper' }));
        const resend = await body.findByRole('menuitem', { name: 'Resend the invitation' });
        // A named icon loads on demand: give it time on a busy machine.
        await waitFor(() => expect(resend.querySelector('svg')).toHaveClass('lucide-mail'), {
            timeout: 5000,
        });
        await expect(
            body.getByRole('menuitem', { name: 'Remove' }).querySelector('svg'),
        ).toHaveClass('lucide-user-minus');
        await userEvent.click(resend);
        await expect(args.onAction).toHaveBeenLastCalledWith(
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
        actions: [
            { id: 'show', kind: 'link', scope: ['item'] },
            { id: 'edit', kind: 'link', scope: ['item'] },
        ],
        getLinkHref: (action: Action, item: ListItem) =>
            action.id === 'edit' ? `#/members/${item.id}/edit` : `#/members/${item.id}`,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(edit).toHaveAttribute('href', '#/members/2/edit');
        await expect(edit).toHaveTextContent('Edit');
        await expect(edit.querySelector('svg')).toHaveClass('lucide-pencil');
        await expect(canvas.getByRole('link', { name: 'View: Grace Hopper' })).toHaveAttribute(
            'href',
            '#/members/2',
        );
        // Ada Lovelace is an owner
        await expect(canvas.queryByRole('link', { name: 'Edit: Ada Lovelace' })).toBeNull();
        await expect(canvas.getByRole('link', { name: 'View: Ada Lovelace' })).toBeVisible();
    },
};

/** The built-in links, and `duplicate` and `delete` in the menu of rows. */
const builtInActions: Action[] = [
    { id: 'show', kind: 'link', scope: ['item'] },
    { id: 'edit', kind: 'link', scope: ['item'] },
    { id: 'duplicate', kind: 'server', scope: ['item'], placement: ['menu'] },
    { id: 'delete', kind: 'server', scope: ['item'], placement: ['menu'], destructive: true },
];

/**
 * The built-in links beside the overflow menu of each row, as most resources show them: one
 * button style for both, whose hover background covers the whole button, with room between them.
 */
export const BuiltInLinksAndMenu: Story = {
    args: {
        items: members.map((member) => ({
            ...member,
            abilities: {
                ...member.abilities,
                view: true,
                update: true,
                duplicate: true,
                delete: true,
            },
        })),
        actions: builtInActions,
        getLinkHref: (action: Action, item: ListItem) =>
            action.id === 'edit' ? `#/members/${item.id}/edit` : `#/members/${item.id}`,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        const menu = canvas.getByRole('button', { name: 'Actions for Grace Hopper' });
        const idle = await settledBackground(edit);

        // The link and the menu button hover alike, with the same background once it has faded in
        await userEvent.hover(edit);
        await waitFor(() => expect(edit).toHaveAttribute('data-hovered'));
        const hovered = await settledBackground(edit);
        await expect(hovered).not.toBe(idle);
        await userEvent.hover(menu);
        await waitFor(() => expect(menu).toHaveAttribute('data-hovered'));
        await expect(await settledBackground(menu)).toBe(hovered);
        await userEvent.unhover(menu);

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
        const button = menu.getBoundingClientRect();
        await expect(link.height).toBe(button.height);
        await expect(link.top).toBe(button.top);
        await expect(getComputedStyle(edit).borderRadius).toBe(getComputedStyle(menu).borderRadius);
        // `--panneau-space-2`
        await expect(button.left - link.right).toBeGreaterThanOrEqual(8);
    },
};

/**
 * The actions of rows on a phone, with a long one: they wrap below each other rather than
 * overflow the item.
 */
export const RowActionsOnAPhone: Story = {
    ...BuiltInLinksAndMenu,
    args: {
        ...BuiltInLinksAndMenu.args,
        actions: [
            ...builtInActions,
            {
                id: 'invoices',
                label: 'Invoices and payment history',
                kind: 'link',
                url: '#/members/{id}/invoices',
                scope: ['item'],
                placement: ['row'],
            },
        ],
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
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        const invoices = canvas.getByRole('link', {
            name: 'Invoices and payment history: Grace Hopper',
        });
        const menu = canvas.getByRole('button', { name: 'Actions for Grace Hopper' });
        const right = table.getBoundingClientRect().right;
        for (const action of [edit, invoices, menu]) {
            await expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(right);
        }
        // On two lines at least
        await expect(menu.getBoundingClientRect().top).toBeGreaterThan(
            edit.getBoundingClientRect().top,
        );
    },
};

/**
 * `delete` alone in the menu of rows: a button at the end of the row rather than a menu of one
 * item (decision 0060), with the same confirmation. Owners can't be deleted: they have no button.
 */
export const DeleteAlone: Story = {
    args: {
        items: members.map((member) => ({
            ...member,
            abilities: {
                ...member.abilities,
                view: true,
                update: true,
                delete: member.role !== 'owner',
            },
        })),
        actions: [
            { id: 'show', kind: 'link', scope: ['item'] },
            { id: 'edit', kind: 'link', scope: ['item'] },
            {
                id: 'delete',
                kind: 'server',
                scope: ['item'],
                placement: ['menu'],
                destructive: true,
                confirm: true,
            },
        ],
        getLinkHref: (action: Action, item: ListItem) =>
            action.id === 'edit' ? `#/members/${item.id}/edit` : `#/members/${item.id}`,
        onAction: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.queryByRole('button', { name: /^Actions for/ })).toBeNull();
        // Ada Lovelace is an owner
        await expect(canvas.queryByRole('button', { name: 'Delete: Ada Lovelace' })).toBeNull();

        const remove = canvas.getByRole('button', { name: 'Delete: Grace Hopper' });
        await expect(remove).toHaveTextContent('');
        await expect(remove.querySelector('svg')).toHaveClass('lucide-trash-2');
        // At the end of the row, after the links, with their height
        const edit = canvas.getByRole('link', { name: 'Edit: Grace Hopper' });
        await expect(remove.getBoundingClientRect().left).toBeGreaterThan(
            edit.getBoundingClientRect().right,
        );
        await expect(remove.getBoundingClientRect().height).toBe(
            edit.getBoundingClientRect().height,
        );

        await userEvent.click(remove);
        const dialog = await body.findByRole('alertdialog');
        await expect(args.onAction).not.toHaveBeenCalled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
        await waitFor(() =>
            expect(args.onAction).toHaveBeenCalledWith(
                expect.objectContaining({ scope: 'item', count: 1 }),
            ),
        );
    },
};

export const Empty: Story = {
    args: {
        items: [],
        emptyMessage: 'Nobody has joined the workspace yet.',
        toolbar: <Button variant="primary">Invite</Button>,
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
        <ListView list={loadingList} columns={columns} items={undefined} layout="cards" />
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
