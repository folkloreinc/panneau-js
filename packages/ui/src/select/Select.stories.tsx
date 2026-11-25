import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TextInput } from '../text-input/TextInput';
import { type OptionValue, Select, type SelectOption } from './Select';

const OPTIONS: SelectOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In review', description: 'Waiting for an editor' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived', disabled: true },
];

const meta = {
    title: 'UI/Select',
    component: Select,
    args: { label: 'Status', options: OPTIONS },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue | null>(null);
        return <Select {...args} multiple={false} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Status/ }));
        await userEvent.click(await body.findByRole('option', { name: /In review/ }));
        const trigger = canvas.getByRole('button', { name: /Status/ });
        await expect(trigger).toHaveTextContent('In review');
        // The chosen label starts at the padding of the trigger, and sits in its middle
        const box = trigger.getBoundingClientRect();
        const label = within(trigger).getByText('In review').getBoundingClientRect();
        const padding = parseFloat(getComputedStyle(trigger).paddingInlineStart);
        await expect(Math.abs(label.left - box.left - padding)).toBeLessThanOrEqual(1);
        await expect(
            Math.abs((label.top + label.bottom) / 2 - (box.top + box.bottom) / 2),
        ).toBeLessThanOrEqual(1);
    },
};

/**
 * `onClear`: a select that can be emptied, such as a filter. With a value, a button in place of its
 * arrow empties it, and the focus goes back to the select.
 */
export const Clearable: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue | null>('draft');
        return (
            <Select
                {...args}
                multiple={false}
                value={value}
                onChange={setValue}
                onClear={() => setValue(null)}
                clearLabel="Clear the status"
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: /Status/ });
        const clear = canvas.getByRole('button', { name: 'Clear the status' });
        const box = trigger.getBoundingClientRect();
        const button = clear.getBoundingClientRect();
        await expect(button.right).toBeLessThanOrEqual(box.right + 1);
        await expect(button.left).toBeGreaterThan(box.left + box.width / 2);
        await userEvent.click(clear);
        await expect(trigger).toHaveTextContent('Select…');
        await expect(trigger).toHaveFocus();
        await expect(canvas.queryByRole('button', { name: 'Clear the status' })).toBeNull();
    },
};

/** Several options read as one line, their labels in a list, cut when it is too long. */
export const Multiple: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue[]>(['draft', 'review', 'published']);
        return (
            <div style={{ maxWidth: '16rem' }}>
                <Select {...args} label="Statuses" multiple value={value} onChange={setValue} />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: /Statuses/ });
        await expect(trigger).toHaveTextContent('Draft, In review, and Published');
        await expect(trigger).not.toHaveTextContent('Waiting for an editor');
        // One line: the trigger keeps the height of a control, where options would stack.
        await expect(trigger.getBoundingClientRect().height).toBeLessThan(48);
    },
};

export const Required: Story = { args: { isRequired: true, description: 'Pick one.' } };

/** An invalid select has the red border of an invalid text input. */
export const WithErrors: Story = {
    args: { errors: ['This value is not one of the choices.'] },
    render: (args) => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <Select {...args} />
            <TextInput label="Title" errors={['This field is required.']} />
            <Select {...args} label="Category" errors={[]} />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const border = (element: Element) => getComputedStyle(element).borderTopColor;
        const trigger = canvas.getByRole('button', { name: /Status/ });
        const input = canvas.getByRole('textbox', { name: 'Title' });
        const valid = canvas.getByRole('button', { name: /Category/ });
        await expect(border(trigger)).toBe(border(input.closest('[data-invalid]') ?? input));
        await expect(border(trigger)).not.toBe(border(valid));
    },
};

/**
 * `labelInside`: the label in the button, before the value (`Status: Draft`), as the filters of a
 * list's toolbar have it. The whole control opens the options, which line up with it; the label
 * stays the name of the select.
 */
export const LabelInside: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue | null>('draft');
        return (
            <div style={{ width: '14rem' }}>
                <Select
                    {...args}
                    multiple={false}
                    labelInside
                    value={value}
                    onChange={setValue}
                    onClear={() => setValue(null)}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const trigger = canvas.getByRole('button', { name: /Status/ });
        const label = trigger.querySelector('.panneau-list-box-inside-label');
        await expect(label).toHaveTextContent('Status');
        // Before the value, on its line
        const value = within(trigger).getByText('Draft');
        await expect(label?.getBoundingClientRect().right).toBeLessThanOrEqual(
            value.getBoundingClientRect().left,
        );
        await userEvent.click(label as Element);
        const listBox = await body.findByRole('listbox');
        await waitFor(() => expect(listBox).toBeVisible());
        const popover = listBox.closest('[data-trigger]') ?? listBox;
        await expect(
            Math.abs(popover.getBoundingClientRect().left - trigger.getBoundingClientRect().left),
        ).toBeLessThan(2);
        await userEvent.keyboard('{Escape}');
    },
};

/**
 * In a page scrolled down (a long form, a list's last filters): the first press opens the options,
 * with a mouse and with a finger, and pressing elsewhere closes them. The page doesn't move.
 */
export const InAScrolledPage: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue | null>('draft');
        return (
            <div>
                <div style={{ height: '150vh' }} />
                <Select
                    {...args}
                    multiple={false}
                    value={value}
                    onChange={setValue}
                    onClear={() => setValue(null)}
                />
                <div style={{ height: '150vh' }} />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const view = canvasElement.ownerDocument.defaultView ?? window;
        const trigger = canvas.getByRole('button', { name: /Status/ });
        trigger.scrollIntoView({ block: 'center' });
        const scrolled = view.scrollY;
        await expect(scrolled).toBeGreaterThan(0);

        // The options open, and stay open once their animation is over
        const isOpen = async () => {
            const listBox = await body.findByRole('listbox');
            await waitFor(() => expect(listBox).toBeVisible());
            await new Promise((resolve) => setTimeout(resolve, 300));
            await expect(listBox).toBeInTheDocument();
            await expect(view.scrollY).toBe(scrolled);
        };

        await userEvent.click(trigger);
        await isOpen();
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());

        // A finger: the options open when it lifts, on the first tap
        await userEvent.pointer([{ keys: '[TouchA>]', target: trigger }, { keys: '[/TouchA]' }]);
        await isOpen();
        await userEvent.keyboard('{Escape}');
    },
};
