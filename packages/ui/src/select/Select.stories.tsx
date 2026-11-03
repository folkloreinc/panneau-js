import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

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

export const Multiple: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue[]>(['draft']);
        return <Select {...args} label="Statuses" multiple value={value} onChange={setValue} />;
    },
};

export const Required: Story = { args: { isRequired: true, description: 'Pick one.' } };

export const WithErrors: Story = { args: { errors: ['This value is not one of the choices.'] } };
