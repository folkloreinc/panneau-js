import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserMinus } from 'lucide-react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { createList } from '@panneau/core';
import type { Action, Field } from '@panneau/protocol';
import { Button } from '@panneau/ui';

import { List } from './List';
import { ListView } from './ListView';
import type { ListColumn, ListItem } from './types';

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
        await waitFor(() => expect(resend.querySelector('svg')).toHaveClass('lucide-mail'));
        await expect(
            body.getByRole('menuitem', { name: 'Remove' }).querySelector('svg'),
        ).toHaveClass('lucide-user-minus');
        await userEvent.click(resend);
        await expect(args.onAction).toHaveBeenLastCalledWith(
            expect.objectContaining({ scope: 'item', count: 1 }),
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

const loadingList = createList();

export const Loading: StoryObj<typeof ListView> = {
    render: () => <ListView list={loadingList} columns={columns} items={undefined} />,
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
