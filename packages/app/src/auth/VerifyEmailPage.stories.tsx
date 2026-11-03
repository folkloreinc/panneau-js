/**
 * Email verification (decision 0048): the page of a user whose address isn't verified, and the
 * page that the link of the email opens.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RateLimitedError, ValidationError } from '@panneau/data';

import { EmailVerificationLinkPage, VerifyEmailPage } from './VerifyEmailPage';

const meta = {
    title: 'App/Verify email page',
    component: VerifyEmailPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Northwind Journal',
        onSend: fn(() => Promise.resolve()),
        onContinue: fn(),
        onLogOut: fn(),
    },
} satisfies Meta<typeof VerifyEmailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new link, on request, and "Continue" once the address is verified. */
export const SendALink: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Send a new link' }));
        await expect(args.onSend).toHaveBeenCalledTimes(1);
        await expect(await canvas.findByRole('status')).toHaveTextContent(
            'A new link is on its way.',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
        await expect(args.onContinue).toHaveBeenCalled();
        await userEvent.click(canvas.getByRole('button', { name: 'Log out' }));
        await expect(args.onLogOut).toHaveBeenCalled();
    },
};

/** A link sent too recently: the message of the backend. */
export const TooSoon: Story = {
    args: {
        onSend: fn(() =>
            Promise.reject(
                new RateLimitedError({
                    type: 'about:blank',
                    title: 'Too many requests. Try again in a minute.',
                    status: 429,
                }),
            ),
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Send a new link' }));
        await expect(await canvas.findByRole('alert')).toHaveTextContent(
            'Too many requests. Try again in a minute.',
        );
    },
};

type LinkStory = StoryObj<typeof EmailVerificationLinkPage>;

/** The link of the email: the address is verified as the page opens. */
export const Link: LinkStory = {
    render: (args) => <EmailVerificationLinkPage {...args} />,
    args: {
        name: 'Northwind Journal',
        token: 'a1b2c3',
        onVerify: fn(() => Promise.resolve()),
        onContinue: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Your email address is verified.')).toBeVisible();
        await expect(args.onVerify).toHaveBeenCalledExactlyOnceWith('a1b2c3');
        await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
        await expect(args.onContinue).toHaveBeenCalled();
    },
};

/** A link that expired: the message of the backend. */
export const ExpiredLink: LinkStory = {
    render: (args) => <EmailVerificationLinkPage {...args} />,
    args: {
        token: 'a1b2c3',
        onVerify: fn(() =>
            Promise.reject(
                new ValidationError({
                    type: 'urn:panneau:problem:validation',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { token: ['This verification link has expired.'] },
                }),
            ),
        ),
        onContinue: fn(),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByRole('alert')).toHaveTextContent(
            'This verification link has expired.',
        );
    },
};

/** The page while the address is verified. */
export const Verifying: LinkStory = {
    render: (args) => <EmailVerificationLinkPage {...args} />,
    args: {
        token: 'a1b2c3',
        onVerify: () => new Promise<void>(() => undefined),
        onContinue: fn(),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('progressbar', { name: 'Verifying your email address…' }),
        ).toBeVisible();
        await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled();
    },
};
