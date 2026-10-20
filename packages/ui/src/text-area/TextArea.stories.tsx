import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { TextArea } from './TextArea';

const meta = {
    title: 'UI/TextArea',
    component: TextArea,
    args: { label: 'Summary', description: 'One or two sentences.' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const textArea = within(canvasElement).getByRole('textbox', { name: 'Summary' });
        await expect(getComputedStyle(textArea).paddingLeft).toBe('12px');
        // The wrapper has the root class only, not the padding of the textarea (#72).
        const wrapper = textArea.closest('.panneau-text-area') as Element;
        await expect(wrapper).not.toBe(textArea);
        await expect(getComputedStyle(wrapper).paddingLeft).toBe('0px');
    },
};

export const WithErrors: Story = { args: { errors: ['This value must be at most 280.'] } };
