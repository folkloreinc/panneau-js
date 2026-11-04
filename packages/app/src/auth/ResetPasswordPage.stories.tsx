/**
 * The page that the link of a password reset opens (decision 0048): the new password, twice.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ValidationError } from '@panneau/data';

import { ResetPasswordPage } from './ResetPasswordPage';

const meta = {
    title: 'App/Reset password page',
    component: ResetPasswordPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Northwind Journal',
        token: 'a1b2c3',
        email: 'ada@example.com',
        onReset: fn(() => Promise.resolve()),
        onDone: fn(),
        onBack: fn(),
    },
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The email of the link, and the new password twice: both must match. */
export const Reset: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
        await userEvent.type(canvas.getByLabelText(/^New password/), 'correct horse');
        await userEvent.type(canvas.getByLabelText(/^Confirm the new password/), 'correct hose');
        await userEvent.click(canvas.getByRole('button', { name: 'Change the password' }));
        await expect(
            canvas.getByLabelText(/^Confirm the new password/),
        ).toHaveAccessibleDescription('The two passwords are different.');
        await expect(args.onReset).not.toHaveBeenCalled();

        await userEvent.clear(canvas.getByLabelText(/^Confirm the new password/));
        await userEvent.type(canvas.getByLabelText(/^Confirm the new password/), 'correct horse');
        await userEvent.click(canvas.getByRole('button', { name: 'Change the password' }));
        await expect(args.onReset).toHaveBeenCalledWith({
            token: 'a1b2c3',
            email: 'ada@example.com',
            password: 'correct horse',
        });
        await expect(args.onDone).toHaveBeenCalledWith('ada@example.com');
    },
};

/** A token the backend refuses, or a password its rules refuse: under their fields. */
export const Errors: Story = {
    args: {
        onReset: fn(() =>
            Promise.reject(
                new ValidationError({
                    type: 'urn:panneau:problem:validation',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { password: ['The password field must be at least 12 characters.'] },
                }),
            ),
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^New password/), 'short');
        await userEvent.type(canvas.getByLabelText(/^Confirm the new password/), 'short');
        await userEvent.click(canvas.getByRole('button', { name: 'Change the password' }));
        await expect(await canvas.findByLabelText(/^New password/)).toHaveAccessibleDescription(
            'The password field must be at least 12 characters.',
        );
    },
};

/** A link without its token. */
export const IncompleteLink: Story = {
    args: { token: null, email: null },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toHaveTextContent('This link is incomplete.');
        await userEvent.click(canvas.getByRole('button', { name: 'Back to login' }));
        await expect(args.onBack).toHaveBeenCalled();
    },
};
