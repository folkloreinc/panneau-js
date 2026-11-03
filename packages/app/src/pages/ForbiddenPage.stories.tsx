/**
 * The page of a route the user can't open (decision 0046): a resource they can't list, a create
 * route without `create`, a page with `view: false`, or a request that answered `403`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ForbiddenPage } from './ForbiddenPage';

const meta = {
    title: 'App/Forbidden page',
    component: ForbiddenPage,
    parameters: { layout: 'fullscreen' },
    args: { homeHref: '/admin' },
} satisfies Meta<typeof ForbiddenPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { level: 1, name: 'You can’t open this page' }),
        ).toBeVisible();
        await expect(canvas.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
            'href',
            '/admin',
        );
    },
};
