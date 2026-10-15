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
        await expect(canvas.getByRole('button', { name: /Status/ })).toHaveTextContent('In review');
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
