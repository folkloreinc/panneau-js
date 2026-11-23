/**
 * The account page (decision 0050): the name and email, the password and the two-factor
 * authentication of the user, on the mock backend.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type DataAdapter, createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type Auth, type Definition, validateDefinition } from '@panneau/protocol';
import { type MockUser, createMockBackend } from '@panneau/protocol/mock';

import { createDefinition } from '../__fixtures__/definition';
import { AccountPage } from './AccountPage';

function definitionOf(auth: Auth): Definition {
    const result = validateDefinition(createDefinition({ auth }));
    if (!result.success) {
        throw new Error('Invalid definition.');
    }
    return result.data;
}

function Account({
    auth,
    users,
    adapter: wrap,
}: {
    auth: Auth;
    users: MockUser[];
    adapter?: (adapter: DataAdapter) => DataAdapter;
}) {
    const [state] = useState(() => {
        const definition = createDefinition({ auth });
        const backend = createMockBackend({ definition, auth: { users } });
        const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
        return {
            adapter: wrap?.(adapter) ?? adapter,
            queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
        };
    });
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <AccountPage definition={definitionOf(auth)} />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const ada: MockUser = { email: 'ada@example.com', password: 'secret', name: 'Ada Lovelace' };

const meta = {
    title: 'App/Account page',
    component: Account,
    args: { auth: { mode: 'panneau', account: true, twoFactor: true }, users: [ada] },
} satisfies Meta<typeof Account>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every section: the profile, the password, and two-factor authentication to set up. */
export const Sections: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByLabelText(/^Name/)).toHaveValue('Ada Lovelace');
        await expect(canvas.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
        await expect(canvas.getByRole('heading', { name: 'Password' })).toBeVisible();
        await expect(
            await canvas.findByRole('button', { name: 'Set up two-factor authentication' }),
        ).toBeVisible();
    },
};

/** Two-factor authentication that the account requires: new codes, but no way to turn it off. */
export const TwoFactorRequired: Story = {
    args: {
        users: [{ ...ada, twoFactor: true, twoFactorRequired: true, recoveryCodes: ['a-b'] }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Two-factor authentication is on.')).toBeVisible();
        await expect(canvas.queryByRole('button', { name: 'Turn it off' })).not.toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'New recovery codes' }));
        const codes = await canvas.findByRole('list', { name: 'Recovery codes' });
        await expect(within(codes).getAllByRole('listitem')).toHaveLength(8);
    },
};

/** Without the password login (a token), nor two-factor authentication: the profile alone. */
export const ProfileOnly: Story = {
    args: { auth: { mode: 'panneau', account: true, token: {} } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByLabelText(/^Name/)).toBeVisible();
        await expect(canvas.queryByRole('heading', { name: 'Password' })).not.toBeInTheDocument();
    },
};

/** Passkeys: their names, what keeps them, when they were added and used. */
export const Passkeys: Story = {
    args: {
        auth: { mode: 'panneau', account: true, passkeys: true },
        users: [{ ...ada, passkeys: [{ id: 'cred-1', name: 'MacBook' }] }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const list = await canvas.findByRole('list', { name: 'Passkeys' });
        await expect(within(list).getByText('MacBook')).toBeVisible();
        await expect(within(list).getByText(/never used/)).toBeVisible();
        await expect(
            canvas.getByRole('button', { name: 'Remove the passkey MacBook' }),
        ).toBeVisible();
        await expect(canvas.getByLabelText(/^Name of the passkey/)).toBeVisible();
    },
};

/** While the account loads: the skeleton of its forms. */
export const Loading: Story = {
    args: {
        adapter: (adapter) => ({
            ...adapter,
            getAccount: () => new Promise(() => undefined),
            getTwoFactor: () => new Promise(() => undefined),
        }),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('status')[0]).toHaveTextContent('Loading…');
        await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
    },
};
