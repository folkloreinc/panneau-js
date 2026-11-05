import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

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
        const toggles = within(canvas.getByRole('list'))
            .getAllByRole('button')
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
