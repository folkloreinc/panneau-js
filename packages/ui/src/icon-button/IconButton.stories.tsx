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
            <IconButton {...args} />
            <IconButton {...args} appearance="outline" />
            <IconButton {...args} tone="accent" />
            <IconButton {...args} tone="danger" icon={Trash} label="Delete" />
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

/**
 * `shortcut`: its keys at the end of the tooltip, and as `aria-keyshortcuts`, rather than in its
 * name (decision 0112).
 */
export const WithShortcut: Story = {
    args: { shortcut: 'Mod+E' },
    play: async ({ canvasElement }) => {
        const button = within(canvasElement).getByRole('button', { name: 'Edit' });
        await expect(button.getAttribute('aria-keyshortcuts')).toMatch(/^(Meta|Control)\+E$/i);
        await userEvent.tab();
        const body = within(canvasElement.ownerDocument.body);
        await expect(await body.findByRole('tooltip')).toHaveTextContent(/^Edit(⌘E|Ctrl\+E)$/);
    },
};
