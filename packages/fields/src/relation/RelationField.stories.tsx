import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createEditableRelationSource, exampleRelationSource } from '../__fixtures__/fields';
import { afterSlides, dragHandle } from '../__fixtures__/reorder';
import type { RelationReference, RelationSearchPage, RelationSource } from '../shared/relation';
import { RelationField } from './RelationField';

const meta = {
    title: 'Fields/Relation',
    component: RelationField,
    args: { label: 'Author', resource: 'authors', source: exampleRelationSource },
} satisfies Meta<typeof RelationField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference | null>(null);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label={args.label}
                multiple={false}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('combobox', { name: 'Author' });
        await userEvent.type(input, 'hop');
        await userEvent.click(await canvas.findByRole('option', { name: 'Grace Hopper' }));
        // The chosen item shows as a card, which keeps the focus
        await expect(canvas.getByRole('listitem')).toHaveTextContent('Grace Hopper');
        await expect(canvas.getByRole('button', { name: 'Change Grace Hopper' })).toHaveFocus();
        // From the keyboard: Change, then Escape keeps the item
        await userEvent.keyboard('{Enter}');
        await expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        await expect(canvas.getByRole('button', { name: 'Change Grace Hopper' })).toHaveFocus();
        await userEvent.click(canvas.getByRole('button', { name: 'Remove Grace Hopper' }));
        await expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveFocus();
    },
};

/** A square image, inline, so that stories don't load anything. */
function swatch(color: string): string {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${color}"/></svg>`,
    )}`;
}

const PEOPLE: RelationReference[] = [
    { id: '1', label: 'Ada Lovelace', description: 'Mathematician', imageUrl: swatch('#2563eb') },
    { id: '2', label: 'Grace Hopper', description: 'Computer scientist' },
    {
        id: '3',
        label: 'Katherine Johnson',
        description: 'Mathematician',
        imageUrl: swatch('#db2777'),
    },
];

/** A source whose items have an image and a description, and open in the app. */
const describedSource: RelationSource = {
    async search(_resource, query) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()));
    },
    async resolve(_resource, ids) {
        return PEOPLE.filter((person) => ids.includes(person.id));
    },
    describe: () => ({ icon: 'users', image: true, description: true }),
    getItemHref: (resource, id) => `#/${resource}/${id}`,
};

/**
 * The chosen items as cards (decision 0067): their image, or a placeholder, their description, a
 * link to each one, and the buttons that change or remove them. References from items (`{ id, label }`)
 * get their image and description from the source.
 */
export const Cards: Story = {
    args: { source: describedSource },
    render: function Render(args) {
        const [single, setSingle] = useState<RelationReference | null>({
            id: '1',
            label: 'Ada Lovelace',
        });
        const [multiple, setMultiple] = useState<RelationReference[] | null>([
            { id: '2', label: 'Grace Hopper' },
            { id: '3', label: 'Katherine Johnson' },
        ]);
        return (
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '28rem' }}>
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Parent"
                    value={single}
                    onChange={setSingle}
                />
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Guests"
                    multiple
                    value={multiple}
                    onChange={setMultiple}
                />
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Read-only"
                    readOnly
                    value={{ id: '1', label: 'Ada Lovelace' }}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const parent = canvas.getByRole('group', { name: 'Parent' });
        await expect(await within(parent).findByText('Mathematician')).toBeVisible();
        await expect(within(parent).getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
            'href',
            '#/people/1',
        );
        const guests = canvas.getByRole('group', { name: 'Guests' });
        await expect(within(guests).getAllByRole('listitem')).toHaveLength(2);
        await userEvent.click(within(guests).getByRole('button', { name: 'Remove Grace Hopper' }));
        await expect(within(guests).getAllByRole('listitem')).toHaveLength(1);
        // The focus goes to the next card, to remove several in a row
        await expect(
            within(guests).getByRole('button', { name: 'Remove Katherine Johnson' }),
        ).toHaveFocus();
        // Read-only: the card, without its buttons
        const readOnly = canvas.getByRole('group', { name: 'Read-only' });
        await expect(within(readOnly).queryByRole('button')).not.toBeInTheDocument();
    },
};

/** Removing a card offers "Undo" in a toast (decision 0063), which puts it back at its place. */
export const Multiple: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference[] | null>([
            { id: '1', label: 'Ada Lovelace' },
            { id: '2', label: 'Grace Hopper' },
            { id: '3', label: 'Margaret Hamilton' },
        ]);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label="Guests"
                multiple
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const guests = within(canvas.getByRole('group', { name: 'Guests' }));
        await userEvent.click(guests.getByRole('button', { name: 'Remove Grace Hopper' }));
        await expect(guests.queryByText('Grace Hopper')).not.toBeInTheDocument();
        await expect(await body.findByText('“Grace Hopper” removed')).toBeInTheDocument();

        await userEvent.click(body.getByRole('button', { name: 'Undo' }));
        await expect(await body.findByText('“Grace Hopper” put back')).toBeInTheDocument();
        await waitFor(() =>
            expect(guests.getAllByRole('listitem').map((card) => card.textContent ?? '')).toEqual([
                expect.stringContaining('Ada Lovelace'),
                expect.stringContaining('Grace Hopper'),
                expect.stringContaining('Margaret Hamilton'),
            ]),
        );
    },
};

export const WithoutSource: Story = {
    args: { source: null },
    render: (args) => (
        <RelationField
            resource="authors"
            source={args.source ?? null}
            label={args.label}
            multiple={false}
            value={{ id: '1', label: 'Ada Lovelace' }}
        />
    ),
};

/** Values that are only ids, as a product's own API gives them: the source resolves their labels. */
export const PlainIds: Story = {
    args: { source: createEditableRelationSource() },
    render: (args) => (
        <RelationField
            resource="authors"
            source={args.source ?? null}
            label="Guests"
            multiple
            value={[
                { id: '1', label: '1' },
                { id: '2', label: '2' },
            ]}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Ada Lovelace')).toBeVisible();
        await expect(canvas.getByText('Grace Hopper')).toBeVisible();
    },
};

/** "Create “…”" in the picker, when the source can create items. */
export const CreateFromThePicker: Story = {
    args: { source: createEditableRelationSource() },
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference[] | null>(null);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label="Guests"
                multiple
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Guests' }), 'Hedy Lamarr');
        await userEvent.click(await canvas.findByRole('option', { name: 'Create “Hedy Lamarr”' }));
        await waitFor(() => expect(canvas.getByText('Hedy Lamarr')).toBeVisible());
        // The picker stays open to add more: close it.
        await userEvent.keyboard('{Escape}');
        await expect(
            await canvas.findByRole('button', { name: 'Remove Hedy Lamarr' }),
        ).toBeVisible();
    },
};

const STATUSES = [
    { label: 'Published', tone: 'success' },
    { label: 'Draft', tone: 'neutral' },
    { label: 'Archived', tone: 'muted' },
] as const;

/** 45 articles, each with a status. */
const ARTICLES: RelationReference[] = Array.from({ length: 45 }, (_, index) => ({
    id: String(index + 1),
    label: `Article ${String(index + 1)}`,
    status: STATUSES[index % STATUSES.length],
}));

/**
 * A source that gives its results by pages of 10, with their total (`searchPage()`), and the status
 * of each item, as `createRelationSource()` does with a resource's `itemStatus`.
 */
const pagedSource: RelationSource = {
    async search(resource, query, { signal }) {
        return (await this.searchPage?.(resource, query, { signal }))?.items ?? [];
    },
    async searchPage(_resource, query, { signal, next }): Promise<RelationSearchPage> {
        await new Promise((resolve) => setTimeout(resolve, 100));
        signal.throwIfAborted();
        const matches = ARTICLES.filter((article) =>
            article.label.toLowerCase().includes(query.toLowerCase()),
        );
        const start = next !== undefined ? Number(next) : 0;
        return {
            items: matches.slice(start, start + 10),
            total: matches.length,
            next: start + 10 < matches.length ? String(start + 10) : null,
        };
    },
    async resolve(_resource, ids) {
        return ARTICLES.filter((article) => ids.includes(article.id));
    },
    describe: () => ({ icon: 'file-text', status: true }),
};

/**
 * The picker says how many results there are, and loads the next ones as its list scrolls to the
 * end (#436).
 */
export const ManyResults: Story = {
    args: { source: pagedSource },
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference | null>(null);
        return (
            <RelationField
                resource="articles"
                source={args.source ?? null}
                label="Article"
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('combobox', { name: 'Article' }));
        const listbox = await body.findByRole('listbox');
        // The first page, with how many results there are
        await expect(await body.findByText(/^\d+ of 45 results$/)).toBeVisible();
        // The next pages load as the list scrolls to its end
        await waitFor(
            () => {
                listbox.scrollTop = listbox.scrollHeight;
                expect(within(listbox).getAllByRole('option')).toHaveLength(45);
            },
            { timeout: 5000 },
        );
        await expect(body.getByText('45 results')).toBeVisible();
        // A search counts its own results
        await userEvent.type(canvas.getByRole('combobox', { name: 'Article' }), '4');
        await expect(await body.findByText('10 results')).toBeVisible();
    },
};

/** Each result and each card shows the status of its item, as a badge in its tone (#436). */
export const Statuses: Story = {
    args: { source: pagedSource },
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference[] | null>([
            { id: '2', label: 'Article 2' },
            { id: '3', label: 'Article 3' },
        ]);
        return (
            <RelationField
                resource="articles"
                source={args.source ?? null}
                label="Related articles"
                multiple
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        // The cards get the status of their items from the source
        const cards = canvas.getByRole('group', { name: 'Related articles' });
        await expect(await within(cards).findByText('Draft')).toHaveClass('panneau-tone-neutral');
        await expect(within(cards).getByText('Archived')).toHaveClass('panneau-tone-muted');
        // A result says its status with its description
        await userEvent.click(canvas.getByRole('combobox', { name: 'Related articles' }));
        const first = await body.findByRole('option', { name: 'Article 1' });
        await expect(first).toHaveAccessibleDescription('Published');
        await expect(
            within(first).getByText('Published', { selector: '.panneau-badge' }),
        ).toHaveClass('panneau-tone-success');
        await userEvent.keyboard('{Escape}');
    },
};

/**
 * In a row of two half columns, the empty field takes the width of its column, as its card does
 * once an item is picked: nothing moves (#410).
 */
export const FullWidth: Story = {
    render: function Render(args) {
        const [author, setAuthor] = useState<RelationReference | null>(null);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <RelationField
                    resource="authors"
                    source={args.source ?? null}
                    label="Author"
                    value={author}
                    onChange={setAuthor}
                />
                <RelationField
                    resource="authors"
                    source={args.source ?? null}
                    label="Editors"
                    multiple
                    value={null}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const author = canvas.getByRole('group', { name: 'Author' });
        const width = author.getBoundingClientRect().width;
        const control = (name: string) =>
            canvas.getByRole('combobox', { name }).closest('.panneau-combo-box');
        await expect(control('Author')?.getBoundingClientRect().width).toBeCloseTo(width, 0);
        await expect(control('Editors')?.getBoundingClientRect().width).toBeCloseTo(width, 0);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Author' }), 'hop');
        await userEvent.click(await canvas.findByRole('option', { name: 'Grace Hopper' }));
        const card = within(author).getByRole('listitem');
        await expect(card.closest('ul')?.getBoundingClientRect().width).toBeCloseTo(width, 0);
    },
};

function Reorderable() {
    const [value, setValue] = useState<RelationReference[] | null>(PEOPLE);
    return (
        <RelationField
            multiple
            resource="people"
            source={describedSource}
            label="People"
            value={value}
            onChange={setValue}
        />
    );
}

const cardNames = (canvasElement: HTMLElement) =>
    [...canvasElement.querySelectorAll('.panneau-tile [data-reorder-handle]')].map((handle) =>
        handle.getAttribute('aria-label'),
    );

/**
 * The cards of a multiple relation reorder (decision 0111): a handle before each card drags it, with
 * the pointer, touch or the keyboard, and "Reorder" in its actions moves it without dragging. The
 * value's order follows.
 */
export const Reorder: Story = {
    render: () => <Reorderable />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const handle = canvas.getByRole('button', { name: 'Move Katherine Johnson' });
        // Above the link of the card, which covers the rest of it
        const rect = handle.getBoundingClientRect();
        await expect(
            handle.contains(
                document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2),
            ),
        ).toBe(true);

        // The pointer: on the upper half of the first card
        const first = canvas.getAllByRole('listitem')[0] as HTMLElement;
        await dragHandle(handle, first, first.getBoundingClientRect().top + 4);
        await waitFor(() =>
            expect(cardNames(canvasElement)).toEqual([
                'Move Katherine Johnson',
                'Move Ada Lovelace',
                'Move Grace Hopper',
            ]),
        );
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'Katherine Johnson moved to position 1 of 3',
        );
        await afterSlides();

        // The keyboard
        canvas.getByRole('button', { name: 'Move Grace Hopper' }).focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() =>
            expect(document.activeElement).toHaveAccessibleName('Before Katherine Johnson'),
        );
        await userEvent.keyboard('{Enter}');
        await waitFor(() =>
            expect(cardNames(canvasElement)).toEqual([
                'Move Grace Hopper',
                'Move Katherine Johnson',
                'Move Ada Lovelace',
            ]),
        );
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move Grace Hopper' })).toHaveFocus(),
        );
        await afterSlides();

        // The menu
        await userEvent.click(canvas.getByRole('button', { name: 'Reorder Grace Hopper' }));
        await userEvent.click(await body.findByRole('menuitem', { name: 'Move to the end' }));
        await waitFor(() =>
            expect(cardNames(canvasElement)).toEqual([
                'Move Katherine Johnson',
                'Move Ada Lovelace',
                'Move Grace Hopper',
            ]),
        );
    },
};

/**
 * In a narrow column, as the sidebar of a form: the cards keep their handles, and their tools are
 * in one menu, so that nothing overflows.
 */
export const ReorderInANarrowColumn: Story = {
    render: () => (
        <div style={{ maxWidth: '18rem' }}>
            <Reorderable />
        </div>
    ),
    play: async ({ canvasElement }) => {
        for (const card of canvasElement.querySelectorAll<HTMLElement>('.panneau-tile')) {
            await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
        }
    },
};

const EDITIONS: RelationReference[] = [
    { id: '2023', label: '2023' },
    { id: '2024', label: '2024' },
];

/** People and editions that the user can edit, where the source says. */
const editableSource: RelationSource = {
    async search(_resource, query) {
        const all = [...PEOPLE, ...EDITIONS];
        return all.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
    },
    async resolve(_resource, ids) {
        return [...PEOPLE, ...EDITIONS].filter((item) => ids.includes(item.id));
    },
    describe: () => ({ icon: 'users', image: true, description: true }),
    async edit(_resource, id) {
        return [...PEOPLE, ...EDITIONS].find((item) => item.id === id) ?? null;
    },
};

/** Whether an element shows, and isn't cut with an ellipsis. */
async function expectWhole(element: Element | null) {
    await expect(element).not.toBeNull();
    if (element !== null) {
        await expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
    }
}

/** The visible buttons of a card that open a menu: one at most (#518). */
const visibleMenus = (card: HTMLElement) =>
    [...card.querySelectorAll<HTMLElement>('button[aria-haspopup]')].filter((button) =>
        button.checkVisibility(),
    );

/**
 * In a sidebar (18rem): the title of each card has the room first (#518). "Change", "Edit" and
 * "Remove" are icon buttons with tooltips, and in a field this narrow they are one "⋯" menu, which
 * also has the moves of a card that reorders: one menu per card, beside the drag handle.
 */
export const InANarrowSidebar: Story = {
    render: function Render() {
        const [edition, setEdition] = useState<RelationReference | null>(EDITIONS[0] ?? null);
        const [people, setPeople] = useState<RelationReference[] | null>(PEOPLE);
        return (
            <div style={{ display: 'grid', gap: '1.5rem', width: '18rem' }}>
                <RelationField
                    resource="editions"
                    source={editableSource}
                    label="Edition"
                    value={edition}
                    onChange={setEdition}
                />
                <RelationField
                    multiple
                    resource="people"
                    source={editableSource}
                    label="People"
                    value={people}
                    onChange={setPeople}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const cards = () => canvas.getAllByRole('listitem');
        await waitFor(() => expect(cards()).toHaveLength(4));

        for (const card of cards()) {
            // The title has the room of the card: whole when it is short (`2023`, `Ada
            // Lovelace`), at least 6rem of it when it is cut, with the full title as its tooltip
            const title = card.querySelector<HTMLElement>('.panneau-tile-title');
            if (['2023', 'Ada Lovelace'].includes(title?.textContent ?? '')) {
                await expectWhole(title);
            }
            await expect(title?.getBoundingClientRect().width).toBeGreaterThanOrEqual(
                6 * parseFloat(getComputedStyle(document.documentElement).fontSize),
            );
            await expect(card.querySelector('.panneau-tile-title [title]')).toHaveAttribute(
                'title',
                card.querySelector('.panneau-tile-title')?.textContent ?? '',
            );
            await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
            // One menu, the "⋯": the menu of moves is in it
            const menus = visibleMenus(card);
            await expect(menus).toHaveLength(1);
            await expect(menus[0]?.getAttribute('aria-label')).toMatch(/^Actions for /);
        }

        // The single field: change, edit and remove, in the menu
        const edition = canvas.getByRole('group', { name: 'Edition' });
        // Its buttons are hidden, out of the accessibility tree too
        await expect(within(edition).queryByRole('button', { name: 'Change 2023' })).toBeNull();
        await userEvent.click(within(edition).getByRole('button', { name: 'Actions for 2023' }));
        const editionMenu = await body.findByRole('menu');
        await expect(
            within(editionMenu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['Change', 'Edit', 'Remove']);
        await userEvent.click(within(editionMenu).getByRole('menuitem', { name: 'Change' }));
        await expect(within(edition).getByRole('combobox', { name: 'Edition' })).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        // Back on the card, the focus is on its menu, the first of its buttons that shows
        await waitFor(() =>
            expect(within(edition).getByRole('button', { name: 'Actions for 2023' })).toHaveFocus(),
        );

        // The multiple field: the handle stays, and the moves are in the same menu
        const people = canvas.getByRole('group', { name: 'People' });
        await expect(
            within(people).getByRole('button', { name: 'Move Ada Lovelace' }),
        ).toBeVisible();
        await expect(
            within(people).queryByRole('button', { name: 'Reorder Ada Lovelace' }),
        ).toBeNull();
        await userEvent.click(
            within(people).getByRole('button', { name: 'Actions for Ada Lovelace' }),
        );
        const peopleMenu = await body.findByRole('menu');
        await expect(
            within(peopleMenu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['Edit', 'Move after Grace Hopper', 'Move to the end', 'Remove']);
        await userEvent.click(
            within(peopleMenu).getByRole('menuitem', { name: 'Move to the end' }),
        );
        await waitFor(() =>
            expect(cardNames(canvasElement)).toEqual([
                'Move Grace Hopper',
                'Move Katherine Johnson',
                'Move Ada Lovelace',
            ]),
        );
    },
};

/** Wide enough, the actions of a card are icon buttons, with their names as tooltips. */
export const IconActions: Story = {
    render: () => (
        <div style={{ width: '32rem' }}>
            <RelationField
                resource="editions"
                source={editableSource}
                label="Edition"
                value={EDITIONS[0] ?? null}
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const card = await canvas.findByRole('listitem');
        await expect(visibleMenus(card)).toHaveLength(0);
        for (const name of ['Change 2023', 'Edit 2023', 'Remove 2023']) {
            const button = canvas.getByRole('button', { name });
            await expect(button).toBeVisible();
            await expect(button).toHaveTextContent('');
        }
        await expect(canvas.queryByRole('button', { name: 'Actions for 2023' })).toBeNull();
        await userEvent.hover(canvas.getByRole('button', { name: 'Edit 2023' }));
        await expect(
            await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
        ).toHaveTextContent('Edit 2023');
    },
};
