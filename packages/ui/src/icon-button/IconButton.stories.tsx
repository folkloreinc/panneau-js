import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconButton } from './IconButton';

const meta = {
    title: 'UI/IconButton',
    component: IconButton,
    args: { icon: Pencil, label: 'Edit', onPress: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
    play: async ({ args, canvasElement }) => {
        const button = within(canvasElement).getByRole('button', { name: 'Edit' });
        await userEvent.click(button);
        await expect(args.onPress).toHaveBeenCalled();
    },
};

export const Variants: Story = {
    render: (args) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <IconButton {...args} variant="ghost" />
            <IconButton {...args} variant="secondary" />
            <IconButton {...args} variant="primary" />
            <IconButton {...args} variant="danger" icon={Trash} label="Delete" />
            <IconButton {...args} size="sm" />
        </div>
    ),
};

export const TooltipOnFocus: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.tab();
        const body = within(canvasElement.ownerDocument.body);
        await expect(await body.findByRole('tooltip')).toHaveTextContent('Edit');
    },
};
