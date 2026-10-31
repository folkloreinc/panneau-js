import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TextAreaField } from '../textarea/TextAreaField';
import { TextField } from './TextField';

const meta = {
    title: 'Fields/Text',
    component: TextField,
    args: { label: 'Title', maxLength: 60, description: 'Shown in search results.' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(null);
        return <TextField {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const input = within(canvasElement).getByRole('textbox', { name: 'Title' });
        await userEvent.type(input, 'Hello');
        await expect(input).toHaveAccessibleDescription(/5 \/ 60 characters/);
    },
};

/** A secret, such as an access key: hidden until the button shows it. */
export const Secret: Story = {
    args: { label: 'Secret access key', description: 'Stored encrypted, never shown again.' },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(null);
        const { maxLength: _, ...props } = args;
        return <TextField {...props} secret value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Secret access key');
        await userEvent.type(input, 'wJalrXUtnFEMI');
        await expect(input).toHaveAttribute('type', 'password');
        await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
        await expect(input).toHaveAttribute('type', 'text');
        await expect(input).toHaveValue('wJalrXUtnFEMI');
    },
};

export const WithErrors: Story = { args: { required: true, errors: ['This field is required.'] } };

export const TextArea: Story = {
    render: (args) => (
        <TextAreaField label="Summary" maxLength={280} description={args.description} />
    ),
};
