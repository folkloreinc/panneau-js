import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { NumberInput } from './NumberInput';

const meta = {
    title: 'UI/NumberInput',
    component: NumberInput,
    args: { label: 'Duration', suffix: 'min', minValue: 0 },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<number | null>(30);
        return <NumberInput {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /Increase/ }));
        await expect(canvas.getByRole('textbox', { name: 'Duration' })).toHaveValue('31');
    },
};

export const Currency: Story = {
    args: {
        label: 'Price',
        suffix: undefined,
        defaultValue: 12.5,
        formatOptions: { style: 'currency', currency: 'CAD' },
    },
};

export const WithErrors: Story = { args: { errors: ['This value must be at least 1.'] } };
