import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Icon } from '../icon/Icon';
import { TextInput } from './TextInput';

const meta = {
    title: 'UI/TextInput',
    component: TextInput,
    args: { label: 'Title', placeholder: 'A short title' },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState('');
        return <TextInput {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const input = within(canvasElement).getByRole('textbox', { name: 'Title' });
        await userEvent.type(input, 'Hello');
        await expect(input).toHaveValue('Hello');
    },
};

export const WithDescription: Story = {
    args: { description: 'Shown in search results.', isRequired: true },
};

export const WithErrors: Story = {
    args: { errors: ['This field is required.'], isRequired: true },
    play: async ({ canvasElement }) => {
        const input = within(canvasElement).getByRole('textbox', { name: /Title/ });
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        await expect(input).toHaveAccessibleDescription('This field is required.');
    },
};

export const WithAdornments: Story = {
    args: {
        label: 'Address',
        prefix: 'https://example.com/',
        defaultValue: 'about',
        placeholder: undefined,
    },
};

export const WithIcon: Story = {
    args: { label: 'Search', prefix: <Icon icon={Search} />, type: 'search' },
};

export const ReadOnlyAndDisabled: Story = {
    render: (args) => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <TextInput {...args} label="Read-only" value="Can't change" isReadOnly />
            <TextInput {...args} label="Disabled" value="Off" isDisabled />
        </div>
    ),
};
