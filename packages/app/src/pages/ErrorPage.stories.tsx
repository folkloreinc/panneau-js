/**
 * The error pages of the app, which plugin pages use too: what is missing or forbidden, a server
 * that failed or can't be reached, and a page that failed while it rendered.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ErrorPage } from './ErrorPage';

const meta = {
    title: 'App/Error pages',
    component: ErrorPage,
    args: { kind: 'not-found', homeHref: '/admin', onRetry: fn() },
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A path, a resource or an item that doesn't exist. Trying again wouldn't help: no button. */
export const NotFound: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Page not found' })).toBeVisible();
        await expect(canvas.queryByRole('button', { name: 'Try again' })).toBeNull();
        await expect(canvas.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
            'href',
            '/admin',
        );
    },
};

/** A `403`, or a resource the user can't list. */
export const Forbidden: Story = {
    args: { kind: 'forbidden' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Access denied' })).toBeVisible();
        await expect(canvas.queryByRole('button', { name: 'Try again' })).toBeNull();
    },
};

/** A `5xx`: announced, with a button to try again. */
export const ServerError: Story = {
    args: { kind: 'server-error' },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toHaveTextContent('The server ran into a problem.');
        await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
        await expect(args.onRetry).toHaveBeenCalledTimes(1);
    },
};

/** No answer: offline, or the server is down. It tries again when the browser is back online. */
export const Offline: Story = {
    args: { kind: 'offline' },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toBeVisible();
        window.dispatchEvent(new Event('online'));
        await expect(args.onRetry).toHaveBeenCalledTimes(1);
    },
};

/** A page that threw while it rendered. */
export const PageError: Story = {
    args: { kind: 'error' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toHaveTextContent('This page ran into a problem.');
    },
};
