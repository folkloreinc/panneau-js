import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Check, Pencil, Search, Trash } from 'lucide-react';
import { expect, waitFor } from 'storybook/test';

import { ThemeScope } from '../root/ThemeScope';
import { defineTheme } from '../theme/defineTheme';
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

/** The stroke scales with the icon (2 units of the 24-unit grid), so every size has the same weight. */
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
    play: async ({ canvasElement }) => {
        const icons = [...canvasElement.querySelectorAll('svg')];
        await expect(icons).toHaveLength(5);
        for (const icon of icons) {
            await expect(getComputedStyle(icon).strokeWidth).toBe('2px');
        }
    },
};

/**
 * A theme sets the weight of every icon with `--panneau-icon-stroke-width`, in units of the grid:
 * here `1.5` for a lighter stroke, set by a theme on a scope.
 */
export const StrokeWidth: Story = {
    render: () => (
        <ThemeScope
            theme={defineTheme({ tokens: { 'panneau-icon-stroke-width': '1.5' } })}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
            <Icon icon={Bell} size="xs" />
            <Icon icon={Check} size="sm" />
            <Icon icon={Pencil} size="md" />
            <Icon icon={Search} size="lg" />
            <Icon icon={Trash} size="xl" />
        </ThemeScope>
    ),
    play: async ({ canvasElement }) => {
        const icons = [...canvasElement.querySelectorAll('svg')];
        await expect(icons).toHaveLength(5);
        // The scope's theme is applied by a style element: wait for it.
        await waitFor(() =>
            expect(icons.map((icon) => getComputedStyle(icon).strokeWidth)).toEqual(
                icons.map(() => '1.5px'),
            ),
        );
    },
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
