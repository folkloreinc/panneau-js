/**
 * The app at boot, while the definition loads: the skeleton of the shell, with the sidebar and a
 * page header, instead of a spinner in the middle of the window.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ShellSkeleton } from './ShellSkeleton';

const meta = {
    title: 'App/Boot',
    component: ShellSkeleton,
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        window.localStorage.removeItem('panneau:sidebar');
    },
} satisfies Meta<typeof ShellSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading…');
        const region = canvasElement.querySelector('[aria-busy="true"]');
        await expect(region?.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
    },
};

/** The sidebar was left collapsed: a rail of icons. */
export const CollapsedSidebar: Story = {
    beforeEach: () => {
        window.localStorage.setItem('panneau:sidebar', 'collapsed');
    },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('status')).toBeInTheDocument();
    },
};
