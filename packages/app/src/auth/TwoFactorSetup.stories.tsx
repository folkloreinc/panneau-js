/**
 * Setting up two-factor authentication (decision 0049): the secret as a QR code and a key, a code
 * to confirm it, then the recovery codes. An operation that needs the password asks for it.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { PasswordConfirmationError } from '@panneau/data';

import { TwoFactorRequiredPage } from './TwoFactorRequiredPage';

const SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="1" height="1"/><rect x="1" y="1" width="1" height="1"/></svg>';
const SETUP = {
    secret: 'JBSWY3DPEHPK3PXP',
    otpauthUrl: 'otpauth://totp/Panneau:ada%40example.com?secret=JBSWY3DPEHPK3PXP',
    qrCode: SVG,
};
const CODES = ['a1b2c-d3e4f', 'g5h6i-j7k8l', 'm9n0o-p1q2r', 's3t4u-v5w6x'];

const meta = {
    title: 'App/Two-factor setup',
    component: TwoFactorRequiredPage,
    parameters: { layout: 'fullscreen' },
    args: {
        name: 'Northwind Journal',
        onEnable: fn(() => Promise.resolve(SETUP)),
        onConfirm: fn(() => Promise.resolve({ recoveryCodes: CODES })),
        onDone: fn(),
        onLogOut: fn(),
    },
} satisfies Meta<typeof TwoFactorRequiredPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A user who must have it: the setup, then the recovery codes. */
export const Required: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(
            canvas.getByRole('button', { name: 'Set up two-factor authentication' }),
        );
        await expect(
            await canvas.findByRole('img', { name: 'QR code of the key' }),
        ).toHaveAttribute('src', expect.stringMatching(/^data:image\/svg\+xml/));
        await expect(canvas.getByText('JBSWY3DPEHPK3PXP')).toBeVisible();
        await userEvent.type(canvas.getByLabelText(/^Code/), '123456');
        await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }));
        await expect(args.onConfirm).toHaveBeenCalledWith('123456');
        const codes = await canvas.findByRole('list', { name: 'Recovery codes' });
        await expect(within(codes).getAllByRole('listitem')).toHaveLength(4);
        await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
        await expect(args.onDone).toHaveBeenCalled();
    },
};

let confirmed = false;

/** The password wasn't confirmed recently: a dialog asks for it, then the setup goes on. */
export const PasswordConfirmation: Story = {
    args: {
        onEnable: fn(() => {
            if (!confirmed) {
                return Promise.reject(
                    new PasswordConfirmationError({
                        type: 'urn:panneau:problem:password-confirmation',
                        title: 'Password confirmation required.',
                        status: 423,
                    }),
                );
            }
            return Promise.resolve(SETUP);
        }),
        onConfirmPassword: fn(() => {
            confirmed = true;
            return Promise.resolve();
        }),
    },
    play: async ({ args, canvasElement }) => {
        confirmed = false;
        const canvas = within(canvasElement);
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(
            canvas.getByRole('button', { name: 'Set up two-factor authentication' }),
        );
        const dialog = await page.findByRole('dialog', { name: 'Confirm your password' });
        await userEvent.type(within(dialog).getByLabelText(/^Password/), 'secret');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
        await expect(args.onConfirmPassword).toHaveBeenCalledWith('secret');
        await expect(await canvas.findByText('JBSWY3DPEHPK3PXP')).toBeVisible();
        await expect(args.onEnable).toHaveBeenCalledTimes(2);
    },
};
