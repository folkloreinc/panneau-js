/**
 * The login page of the `panneau` auth mode, as the auth settings of the definition or of the boot
 * config describe it: an email and a password, a token, OAuth providers.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ValidationError } from '@panneau/data';

import { LoginPage } from './LoginPage';

const meta = {
    title: 'App/Login page',
    component: LoginPage,
    parameters: { layout: 'fullscreen' },
    args: {
        auth: { mode: 'panneau' },
        onLogIn: fn((): Promise<'two-factor' | void> => Promise.resolve()),
    },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An email and a password, by default. */
export const Password: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^Email/), 'ada@example.com');
        await userEvent.type(canvas.getByLabelText(/^Password/), 'secret');
        await userEvent.click(canvas.getByRole('button', { name: 'Log in' }));
        await expect(args.onLogIn).toHaveBeenCalledWith({
            email: 'ada@example.com',
            password: 'secret',
            remember: false,
        });
    },
};

/** A single secret, for a backend that logs in with a token (`auth.token`). */
export const Token: Story = {
    args: {
        name: 'Media server',
        auth: {
            mode: 'panneau',
            token: { label: 'Admin token', help: 'The ADMIN_TOKEN of the server.' },
        },
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByLabelText(/^Email/)).not.toBeInTheDocument();
        const token = canvas.getByLabelText(/^Admin token/);
        await expect(token).toHaveAccessibleDescription('The ADMIN_TOKEN of the server.');
        await userEvent.type(token, 's3cret');
        await userEvent.keyboard('{Enter}');
        await expect(args.onLogIn).toHaveBeenCalledWith({ token: 's3cret' });
    },
};

/** Every way to log in, with "or" between them. */
export const Everything: Story = {
    args: {
        auth: {
            mode: 'panneau',
            password: true,
            token: { label: 'Access code' },
            providers: [{ id: 'google', label: 'Google', url: '/panneau/auth/google' }],
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByLabelText(/^Email/)).toBeInTheDocument();
        await expect(canvas.getByLabelText(/^Access code/)).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: 'Log in with Google' })).toHaveAttribute(
            'href',
            '/panneau/auth/google',
        );
        await expect(canvas.getAllByText('or')).toHaveLength(2);
    },
};

/** The errors of the backend: under the field they are about. */
export const Errors: Story = {
    args: {
        onLogIn: fn(() =>
            Promise.reject(
                new ValidationError({
                    type: 'about:blank',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { email: ['These credentials do not match our records.'] },
                }),
            ),
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^Email/), 'ada@example.com');
        await userEvent.type(canvas.getByLabelText(/^Password/), 'wrong');
        await userEvent.click(canvas.getByRole('button', { name: 'Log in' }));
        await expect(await canvas.findByLabelText(/^Email/)).toHaveAccessibleDescription(
            'These credentials do not match our records.',
        );
    },
};

/**
 * `auth.passwordReset`: a link to a form that asks for a reset link, with the email typed so far.
 * The page says the link is on its way whether or not the address has an account.
 */
export const ForgotPassword: Story = {
    args: {
        auth: { mode: 'panneau', passwordReset: true },
        onForgotPassword: fn(() => Promise.resolve()),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^Email/), 'ada@example.com');
        await userEvent.click(canvas.getByRole('button', { name: 'Forgot your password?' }));
        await expect(canvas.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
        await expect(canvas.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
        await userEvent.click(canvas.getByRole('button', { name: 'Send the link' }));
        await expect(args.onForgotPassword).toHaveBeenCalledWith('ada@example.com');
        await expect(await canvas.findByRole('status')).toHaveTextContent(
            /a link to choose a new password is on its way/,
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Back to login' }));
        await expect(canvas.getByRole('heading', { name: 'Log in' })).toBeVisible();
    },
};

/** After a password reset: a message, and the email filled in. */
export const AfterPasswordReset: Story = {
    args: { notice: 'password-reset', email: 'ada@example.com' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'Your password was changed. Log in with your new password.',
        );
        await expect(canvas.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
    },
};

/** A login that waits for its second factor: a code of the app, or a recovery code. */
export const TwoFactor: Story = {
    args: {
        onLogIn: fn((): Promise<'two-factor' | void> => Promise.resolve('two-factor')),
        onTwoFactorChallenge: fn(() => Promise.resolve()),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/^Email/), 'ada@example.com');
        await userEvent.type(canvas.getByLabelText(/^Password/), 'secret');
        await userEvent.click(canvas.getByRole('button', { name: 'Log in' }));
        await expect(
            await canvas.findByRole('heading', { name: 'Two-factor authentication' }),
        ).toBeVisible();
        await userEvent.type(canvas.getByLabelText(/^Code/), '123456');
        await userEvent.click(canvas.getByRole('button', { name: 'Verify' }));
        await expect(args.onTwoFactorChallenge).toHaveBeenCalledWith({ code: '123456' });

        await userEvent.click(canvas.getByRole('button', { name: 'Use a recovery code' }));
        await expect(canvas.getByLabelText(/^Recovery code/)).toHaveValue('');
        await userEvent.click(canvas.getByRole('button', { name: 'Back to login' }));
        await expect(canvas.getByRole('heading', { name: 'Log in' })).toBeVisible();
    },
};

/** The session ended while the user was in the app. */
export const SessionEnded: Story = {
    args: { name: 'Northwind Journal', sessionEnded: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent(
            'Your session has ended. Log in again to continue.',
        );
    },
};
