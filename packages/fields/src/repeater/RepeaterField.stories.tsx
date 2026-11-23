import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { BlockType } from '@panneau/protocol';

import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import { RepeaterField, type RepeaterItem } from './RepeaterField';

const meta = {
    title: 'Fields/Repeater',
    component: RepeaterField,
    args: {
        label: 'Links',
        name: 'links',
        fields: [
            { name: 'label', type: 'text', label: 'Label' },
            { name: 'url', type: 'url', label: 'URL' },
        ],
    },
    decorators: [
        (Story) => (
            <FieldsProvider components={builtInFields}>
                <Story />
            </FieldsProvider>
        ),
    ],
} satisfies Meta<typeof RepeaterField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Items: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>([
            { label: 'Site', url: 'https://example.com' },
        ]);
        return <RepeaterField {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The item the list had starts collapsed, and the one added expanded.
        await expect(canvas.getByRole('button', { name: '1 Item 1 Site' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
        await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
        await expect(canvas.getByRole('button', { name: '2 Item 2' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Move item 2 up' }));
        // The expanded item moved up, and stayed expanded.
        await expect(canvas.getByRole('button', { name: '1 Item 1' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        await userEvent.click(canvas.getByRole('button', { name: '2 Item 2 Site' }));
        await expect(canvas.getAllByRole('textbox', { name: 'Label' })[1]).toHaveValue('Site');
    },
};

/**
 * Removing an item offers "Undo" in a toast (decision 0063), which puts it back at its place, with
 * its value and whether it was expanded. Each item keeps its state and the focus as it moves.
 */
export const UndoRemove: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>([
            { label: 'Site', url: 'https://example.com' },
            { label: 'Shop', url: 'https://shop.example.com' },
            { label: 'Blog', url: 'https://blog.example.com' },
        ]);
        return <RepeaterField {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: '2 Item 2 Shop' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Remove item 2' }));
        await expect(canvas.queryByText('Shop')).not.toBeInTheDocument();
        await expect(await body.findByText('“Item 2” removed')).toBeInTheDocument();

        await userEvent.click(body.getByRole('button', { name: 'Undo' }));
        await expect(await body.findByText('“Item 2” put back')).toBeInTheDocument();
        // Back at its place, expanded as it was, with the focus on its header
        const header = canvas.getByRole('button', { name: '2 Item 2' });
        await expect(header).toHaveAttribute('aria-expanded', 'true');
        await expect(header).toHaveFocus();
        await expect(canvas.getByRole('textbox', { name: 'Label' })).toHaveValue('Shop');

        // The item moves with its state, and the focus follows it
        await userEvent.click(canvas.getByRole('button', { name: 'Move item 2 down' }));
        await expect(canvas.getByRole('button', { name: '3 Item 3' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        await expect(canvas.getByRole('button', { name: 'Move item 3 up' })).toHaveFocus();
    },
};

const BLOCKS: RepeaterItem[] = [
    { type: 'heading', text: 'A summer in Montréal' },
    {
        type: 'text',
        body: '<p>The city has <strong>festivals</strong> every week, from jazz to fireworks.</p>',
    },
    { type: 'video', url: 'https://example.com/videos/fireworks' },
    { type: 'quote', text: 'Montréal is the best city in the world in summer.' },
];

/**
 * The blocks of a page: saved blocks start collapsed, with their type and their first text. A
 * block added expands, and "Expand all" or "Collapse all" opens or closes every block.
 */
export const TypedBlocks: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>(BLOCKS);
        return (
            <RepeaterField
                {...args}
                label="Blocks"
                fields={undefined}
                types={[
                    {
                        id: 'heading',
                        label: 'Heading',
                        fields: [{ name: 'text', type: 'text', label: 'Heading' }],
                    },
                    {
                        id: 'text',
                        label: 'Text',
                        fields: [{ name: 'body', type: 'textarea', label: 'Body' }],
                    },
                    {
                        id: 'quote',
                        label: 'Quote',
                        fields: [{ name: 'text', type: 'textarea', label: 'Text' }],
                    },
                    {
                        id: 'video',
                        label: 'Video',
                        fields: [{ name: 'url', type: 'url', label: 'Video URL' }],
                    },
                ]}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // The headers of the items, not the controls between them
        const toggles = within(canvas.getByRole('list'))
            .getAllByRole('button')
            .filter((button) => button.closest('[data-header]') !== null)
            .filter((button) => button.hasAttribute('aria-expanded'));
        await expect(toggles).toHaveLength(4);
        for (const toggle of toggles) {
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        }
        await expect(
            canvas.getByText('The city has festivals every week, from jazz to fireworks.'),
        ).toBeVisible();
        // The keyboard expands an item, and the focus stays on its header.
        const [first] = toggles;
        first?.focus();
        await userEvent.keyboard('{Enter}');
        await expect(first).toHaveAttribute('aria-expanded', 'true');
        await expect(first).toHaveFocus();
        await expect(canvas.getByRole('textbox', { name: 'Heading' })).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Collapse all' }));
        await expect(first).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(canvas.getByRole('button', { name: 'Expand all' }));
        for (const toggle of toggles) {
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        }
    },
};

/** An item with an error expands by itself, and its header says it has errors. */
export const ItemWithAnError: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>([
            { label: 'Site', url: 'https://example.com' },
            { label: 'Shop', url: 'shop' },
        ]);
        return (
            <RepeaterField
                {...args}
                value={value}
                onChange={setValue}
                invalidPaths={['links.1.url']}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: '1 Item 1 Site' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        const invalid = canvas.getByRole('button', { name: '2 Item 2 Has errors' });
        await expect(invalid).toHaveAttribute('aria-expanded', 'true');
        await expect(canvas.getAllByRole('textbox', { name: 'URL' })[0]).toHaveValue('shop');
    },
};

/** Read-only: items still expand and collapse, without the tools that change them. */
export const ReadOnly: Story = {
    args: {
        readOnly: true,
        value: [
            { label: 'Site', url: 'https://example.com' },
            { label: 'Shop', url: 'https://shop.example.com' },
        ],
    },
};

/** `collapsible: false`: every item shows its fields, as before decision 0068. */
export const NotCollapsible: Story = {
    args: {
        collapsible: false,
        value: [{ label: 'Site', url: 'https://example.com' }],
    },
};

/**
 * "Duplicate" adds a copy right after an item, expanded, with the focus on its header. Between two
 * items, a control adds one there: it shows on hover and on keyboard focus.
 */
export const DuplicateAndAddInBetween: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>([
            { label: 'Site', url: 'https://example.com' },
            { label: 'Shop', url: 'https://shop.example.com' },
        ]);
        return <RepeaterField {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Duplicate item 1' }));
        const copy = canvas.getByRole('button', { name: '2 Item 2' });
        await expect(copy).toHaveAttribute('aria-expanded', 'true');
        await expect(copy).toHaveFocus();
        await expect(canvas.getByRole('textbox', { name: 'Label' })).toHaveValue('Site');
        await expect(canvas.getAllByRole('listitem')).toHaveLength(3);

        // Hidden until it gets the keyboard focus, from the tools of the (collapsed) item before it
        const insert = canvas.getByRole('button', { name: 'Add an item between items 1 and 2' });
        await expect(getComputedStyle(insert).opacity).toBe('0');
        canvas.getByRole('button', { name: 'Remove item 1' }).focus();
        await userEvent.tab();
        await expect(insert).toHaveFocus();
        await waitFor(() => expect(getComputedStyle(insert).opacity).toBe('1'));
        await userEvent.keyboard('{Enter}');
        const added = canvas.getByRole('button', { name: '2 Item 2' });
        await expect(added).toHaveAttribute('aria-expanded', 'true');
        await expect(added).toHaveFocus();
        await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
        await expect(canvas.getByRole('button', { name: '3 Item 3' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '4 Item 4 Shop' })).toBeInTheDocument();
    },
};

const BLOCK_TYPES: BlockType[] = [
    {
        id: 'heading',
        label: 'Heading',
        icon: 'heading',
        description: 'A title between sections',
        itemTitle: 'text',
        fields: [{ name: 'text', type: 'text', label: 'Heading' }],
    },
    {
        id: 'text',
        label: 'Text',
        icon: 'pilcrow',
        description: 'Paragraphs, lists and links',
        fields: [{ name: 'body', type: 'textarea', label: 'Body' }],
    },
    {
        id: 'quote',
        label: 'Quote',
        icon: 'quote',
        description: 'A quote and who said it',
        itemTitle: '{text} ({author})',
        fields: [
            { name: 'text', type: 'textarea', label: 'Text' },
            { name: 'author', type: 'text', label: 'Author' },
        ],
    },
    {
        id: 'embed',
        label: 'Embed',
        description: 'A type without an icon',
        fields: [{ name: 'url', type: 'url', label: 'URL of the page' }],
    },
];

/**
 * The menu of block types shows the icon and the description of each type; a type without an
 * icon keeps its place. A block is added between two others from the same menu, and blocks are
 * titled from the `itemTitle` of their type.
 */
export const BlockTypeMenu: Story = {
    render: function Render() {
        const [value, setValue] = useState<unknown>([
            { type: 'heading', text: 'A summer in Montréal' },
            { type: 'quote', text: 'The best city in summer.', author: 'A visitor' },
        ]);
        return (
            <DefinitionField
                field={{ name: 'blocks', type: 'repeater', label: 'Blocks', types: BLOCK_TYPES }}
                path="blocks"
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(
            await canvas.findByRole('button', { name: '1 A summer in Montréal' }),
        ).toBeInTheDocument();
        await expect(
            canvas.getByRole('button', { name: '2 The best city in summer. (A visitor)' }),
        ).toBeInTheDocument();

        // From the keyboard: the control shows once it has the focus, and opens the menu of types
        const insert = canvas.getByRole('button', { name: 'Add an item between items 1 and 2' });
        canvas.getByRole('button', { name: 'Remove item 1' }).focus();
        await userEvent.tab();
        await expect(insert).toHaveFocus();
        await waitFor(() => expect(getComputedStyle(insert).opacity).toBe('1'));
        await userEvent.keyboard('{Enter}');
        const quote = await body.findByRole('menuitem', { name: 'Quote' });
        await expect(quote).toHaveAccessibleDescription('A quote and who said it');
        await waitFor(() => expect(quote.querySelector('svg.lucide-quote')).not.toBeNull());
        // The type without an icon: its label lines up with the others
        const embed = body.getByRole('menuitem', { name: 'Embed' });
        const label = (item: HTMLElement) =>
            (item.querySelector('[slot="label"]') as HTMLElement).getBoundingClientRect().left;
        await expect(label(embed)).toBe(label(quote));

        await userEvent.click(quote);
        const added = canvas.getByRole('button', { name: '2 Quote' });
        await expect(added).toHaveAttribute('aria-expanded', 'true');
        await waitFor(() => expect(added).toHaveFocus());
        await expect(canvas.getByRole('textbox', { name: 'Author' })).toBeVisible();
    },
};

/**
 * `settings.itemTitle` names the field, or a template of fields, that titles each item. Without a
 * value for it, an item is titled "Item 2", with its first text.
 */
export const TitlesFromTheDefinition: Story = {
    render: function Render() {
        const [value, setValue] = useState<unknown>([
            { first_name: 'Ada', last_name: 'Lovelace', role: 'director' },
            { first_name: 'Grace', last_name: 'Hopper' },
            { note: 'Someone to find' },
        ]);
        return (
            <DefinitionField
                field={{
                    name: 'credits',
                    type: 'repeater',
                    label: 'Credits',
                    settings: { itemTitle: '{first_name} {last_name} ({role})' },
                    fields: [
                        { name: 'first_name', type: 'text', label: 'First name' },
                        { name: 'last_name', type: 'text', label: 'Last name' },
                        {
                            name: 'role',
                            type: 'select',
                            label: 'Role',
                            options: [
                                { value: 'director', label: 'Director' },
                                { value: 'writer', label: 'Writer' },
                            ],
                        },
                        { name: 'note', type: 'textarea', label: 'Note' },
                    ],
                }}
                path="credits"
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await canvas.findByRole('button', { name: '1 Ada Lovelace (Director)' }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: '2 Grace Hopper' })).toBeInTheDocument();
        await expect(
            canvas.getByRole('button', { name: '3 Item 3 Someone to find' }),
        ).toBeInTheDocument();
        // The title follows the values
        await userEvent.click(canvas.getByRole('button', { name: '2 Grace Hopper' }));
        await userEvent.type(canvas.getByRole('textbox', { name: 'First name' }), ' B.');
        await expect(canvas.getByRole('button', { name: '2 Grace B. Hopper' })).toBeInTheDocument();
    },
};
