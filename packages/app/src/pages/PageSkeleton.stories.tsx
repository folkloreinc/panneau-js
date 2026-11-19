/**
 * A page whose code loads on first use (#346): the account page or an auth page shows
 * the skeleton of its shape until its code is there, instead of a blank panel.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { AuthSkeleton } from '../auth/AuthLayout';
import { PageSkeleton } from './PageSkeleton';

const meta = {
    title: 'App/Page skeleton',
    component: PageSkeleton,
} satisfies Meta<typeof PageSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

async function expectSkeleton(canvasElement: HTMLElement) {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading…');
    const region = canvasElement.querySelector('[aria-busy="true"]');
    await expect(region?.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
}

/** A page of the default width: its title and blocks of content. */
export const Loading: Story = {
    play: async ({ canvasElement }) => {
        await expectSkeleton(canvasElement);
    },
};

/** The account page: a narrow page. */
export const Narrow: Story = {
    args: { width: 'narrow', blocks: 3 },
    play: async ({ canvasElement }) => {
        await expectSkeleton(canvasElement);
    },
};

/** An auth page, such as the login page: a title, fields and a button, centered in the window. */
export const AuthPage: Story = {
    parameters: { layout: 'fullscreen' },
    render: () => <AuthSkeleton />,
    play: async ({ canvasElement }) => {
        await expectSkeleton(canvasElement);
    },
};
