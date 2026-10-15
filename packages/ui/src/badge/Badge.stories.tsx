import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
    title: 'UI/Badge',
    component: Badge,
    args: { children: 'Draft' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Badge {...args} tone="neutral" />
            <Badge {...args} tone="accent">
                New
            </Badge>
            <Badge {...args} tone="success">
                Published
            </Badge>
            <Badge {...args} tone="warning">
                Scheduled
            </Badge>
            <Badge {...args} tone="danger" label="3 errors">
                3
            </Badge>
            <Badge {...args} tone="info">
                Info
            </Badge>
        </div>
    ),
};
