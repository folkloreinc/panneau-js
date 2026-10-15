import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RadioGroup } from './RadioGroup';

const meta = {
    title: 'UI/RadioGroup',
    component: RadioGroup,
    args: {
        label: 'Format',
        options: [
            { value: 'square', label: 'Square', description: '1:1' },
            { value: 'portrait', label: 'Portrait', description: '4:5' },
            { value: 'story', label: 'Story', description: '9:16' },
        ],
    },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
    play: async ({ canvasElement }) => {
        const radio = within(canvasElement).getByRole('radio', { name: /Portrait/ });
        await userEvent.click(radio);
        await expect(radio).toBeChecked();
    },
};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const WithErrors: Story = { args: { errors: ['Pick a format.'], isRequired: true } };
