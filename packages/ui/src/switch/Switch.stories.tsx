import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Switch } from './Switch';

const meta = {
    title: 'UI/Switch',
    component: Switch,
    args: { children: 'Notifications', description: 'Get an email for each comment.' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const toggle = within(canvasElement).getByRole('switch', { name: 'Notifications' });
        await userEvent.click(toggle);
        await expect(toggle).toBeChecked();
    },
};

export const Disabled: Story = { args: { isDisabled: true, defaultSelected: true } };
