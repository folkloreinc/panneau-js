import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Check, Pencil, Search, Trash } from 'lucide-react';
import { expect, waitFor } from 'storybook/test';

import { Icon } from './Icon';
import { getNamedIcon } from './namedIcons';

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

/**
 * Icons by their Lucide name, as definitions give them (`"icon": "send"`). Each one is loaded the
 * first time it renders, with an empty space of the same size until then.
 */
export const ByName: Story = {
    render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Icon icon={getNamedIcon('send')} size="lg" />
            <Icon icon={getNamedIcon('calendar-days')} size="lg" />
            <Icon icon={getNamedIcon('archive')} size="lg" label="Archive" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        // The first named icon loads Lucide's list of names: give it time on a busy machine.
        await waitFor(
            () => expect(canvasElement.querySelectorAll('svg[data-loading]')).toHaveLength(0),
            { timeout: 5000 },
        );
        await expect(canvasElement.querySelector('svg.lucide-send')).not.toBeNull();
    },
};
