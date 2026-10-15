import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Check, Pencil, Search, Trash } from 'lucide-react';

import { Icon } from './Icon';

const meta = {
    title: 'UI/Icon',
    component: Icon,
    args: { icon: Pencil },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {};

export const Labelled: Story = { args: { label: 'Edit', size: 'xl' } };

export const Sizes: Story = {
    render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Icon icon={Bell} size="xs" />
            <Icon icon={Check} size="sm" />
            <Icon icon={Pencil} size="md" />
            <Icon icon={Search} size="lg" />
            <Icon icon={Trash} size="xl" />
        </div>
    ),
};
