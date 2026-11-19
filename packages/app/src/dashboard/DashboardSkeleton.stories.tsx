/**
 * A dashboard while its code loads, on first use (#346): its title, and a card for each widget in
 * the grid, before the widgets draw the skeletons of their charts while their data loads.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { validateDefinition } from '@panneau/protocol';

import { DASHBOARD_WIDGETS, createDashboardDefinition } from '../__fixtures__/dashboard';
import { DashboardSkeleton } from './DashboardSkeleton';

const result = validateDefinition(createDashboardDefinition());
if (!result.success) {
    throw new Error('The dashboard definition is invalid.');
}

const meta = {
    title: 'App/Dashboard skeleton',
    component: DashboardSkeleton,
    args: { definition: result.data },
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(canvasElement.querySelectorAll('[aria-busy="true"]')).toHaveLength(
            DASHBOARD_WIDGETS.length,
        );
    },
};
