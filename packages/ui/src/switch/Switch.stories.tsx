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

export const RightToLeft: Story = {
    args: { defaultSelected: true },
    decorators: [
        (StoryComponent) => (
            <div dir="rtl">
                <StoryComponent />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const toggle = within(canvasElement).getByRole('switch', { name: 'Notifications' });
        await expect(toggle).toBeChecked();
        const thumb = canvasElement.querySelector<HTMLElement>('[class*="thumb"]');
        const track = thumb?.parentElement;
        if (thumb === null || track === null || track === undefined) {
            throw new Error('No thumb');
        }
        // Checked in RTL, the thumb is at the left end of the track, inside it.
        const thumbBox = thumb.getBoundingClientRect();
        const trackBox = track.getBoundingClientRect();
        await expect(thumbBox.left).toBeGreaterThanOrEqual(trackBox.left);
        await expect(thumbBox.right).toBeLessThanOrEqual(trackBox.right);
        await expect(thumbBox.left - trackBox.left).toBeLessThan(trackBox.right - thumbBox.right);
    },
};
