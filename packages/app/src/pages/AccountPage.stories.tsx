/**
 * The account page (decision 0050): the name and email, the password, the two-factor
 * authentication, the passkeys and the connections to the MCP server (decision 0113) of the user,
 * on the mock backend.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { LeaveGuardsProvider, createLeaveGuards } from '@panneau/core';
import { type DataAdapter, createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type Agents, type Auth, type Definition, validateDefinition } from '@panneau/protocol';
import { type MockUser, createMockBackend } from '@panneau/protocol/mock';
import { Button } from '@panneau/ui';

import { createDefinition } from '../__fixtures__/definition';
import { AccountPage } from './AccountPage';

function definitionOf(auth: Auth, agents: Agents | undefined): Definition {
    const result = validateDefinition(
        createDefinition({ auth, ...(agents !== undefined && { agents }) }),
    );
    if (!result.success) {
        throw new Error('Invalid definition.');
    }
    return result.data;
}

function Account({
    auth,
    agents,
    users,
    adapter: wrap,
    leaveButton = false,
}: {
    auth: Auth;
    /** `agents.mcp` shows the connections of the user. */
    agents?: Agents;
    users: MockUser[];
    adapter?: (adapter: DataAdapter) => DataAdapter;
    /** A link out of the page, which asks the guards of unsaved changes, as the router does. */
    leaveButton?: boolean;
}) {
    const [guards] = useState(createLeaveGuards);
    const [left, setLeft] = useState<boolean | null>(null);
    const [state] = useState(() => {
        const definition = createDefinition({ auth, ...(agents !== undefined && { agents }) });
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
                <LeaveGuardsProvider guards={guards}>
                    {leaveButton ? (
                        <p>
                            <Button onPress={() => void guards.confirmLeave().then(setLeft)}>
                                Go to another page
                            </Button>{' '}
                            {left === null ? null : left ? 'Left the page.' : 'Stayed.'}
                        </p>
                    ) : null}
                    <AccountPage definition={definitionOf(auth, agents)} />
                </LeaveGuardsProvider>
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

/**
 * Leaving the page with changes to the profile asks first, as leaving a form page does: "Stay"
 * keeps them. Unchanged, or once saved, the page is left without asking.
 */
export const UnsavedProfile: Story = {
    args: { auth: { mode: 'panneau', account: true, token: {} }, leaveButton: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const name = await canvas.findByLabelText(/^Name/);
        await userEvent.click(canvas.getByRole('button', { name: 'Go to another page' }));
        await expect(await canvas.findByText('Left the page.')).toBeVisible();
        await expect(body.queryByRole('alertdialog')).not.toBeInTheDocument();

        await userEvent.clear(name);
        await userEvent.type(name, 'Ada King');
        await userEvent.click(canvas.getByRole('button', { name: 'Go to another page' }));
        const ask = await body.findByRole('alertdialog', { name: 'Leave without saving?' });
        await userEvent.click(within(ask).getByRole('button', { name: 'Stay' }));
        await expect(await canvas.findByText('Stayed.')).toBeVisible();
        await expect(name).toHaveValue('Ada King');

        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        await expect(await body.findByText('Your account was saved.')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Go to another page' }));
        await expect(await canvas.findByText('Left the page.')).toBeVisible();
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

const mcp = { url: 'https://example.com/panneau/mcp' };

/**
 * The connections to the MCP server: a personal token that can change content, used and expiring,
 * and an app the user authorized, which only reads. The address of the server is there to copy.
 */
export const Connections: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp: { ...mcp, tokens: true } },
        users: [
            {
                ...ada,
                connections: [
                    { name: 'Claude', write: true },
                    { name: 'Notes app', type: 'client' },
                ],
            },
        ],
        adapter: (adapter) => ({
            ...adapter,
            listConnections: async (options) =>
                (await adapter.listConnections?.(options))?.map((connection) =>
                    connection.type === 'token'
                        ? {
                              ...connection,
                              createdAt: '2026-11-02T10:00:00Z',
                              lastUsedAt: '2026-11-20T15:30:00Z',
                              expiresAt: '2027-11-02T10:00:00Z',
                          }
                        : { ...connection, createdAt: '2026-10-14T09:00:00Z' },
                ) ?? [],
        }),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByLabelText('Address of the MCP server')).toHaveValue(mcp.url);
        const list = await canvas.findByRole('list', { name: 'Connections' });
        const [token, client] = within(list).getAllByRole('listitem');
        await expect(token).toHaveTextContent(
            /personal token · read and change · made on .* · last used on .* · expires on /,
        );
        await expect(client).toHaveTextContent(/app · read · made on .* · never expires/);
        await expect(
            canvas.getByRole('button', { name: 'Revoke the connection Notes app' }),
        ).toBeVisible();
        await expect(canvas.getByRole('button', { name: 'New personal token' })).toBeVisible();
    },
};

/** No connections yet: the address of the server, and a personal token to make. */
export const ConnectionsEmpty: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp: { ...mcp, tokens: true } },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('You have no connections yet.')).toBeVisible();
        await expect(canvas.getByRole('button', { name: 'New personal token' })).toBeVisible();
    },
};

/** A backend that can't make personal tokens (no `agents.mcp.tokens`): no button to make one. */
export const ConnectionsWithoutTokens: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp },
        users: [{ ...ada, connections: [{ name: 'Notes app', type: 'client' }] }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByRole('list', { name: 'Connections' })).toBeVisible();
        await expect(
            canvas.queryByRole('button', { name: 'New personal token' }),
        ).not.toBeInTheDocument();
    },
};

/**
 * A personal token just made: shown once, with a button that copies it. "Done" forgets it, and
 * gives the focus back to the button that made it.
 */
export const TokenMade: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp: { ...mcp, tokens: true } },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(await canvas.findByRole('button', { name: 'New personal token' }));
        const dialog = await body.findByRole('dialog', { name: 'New personal token' });
        await userEvent.type(within(dialog).getByLabelText(/^Name of the token/), 'Claude');
        await userEvent.click(within(dialog).getByRole('button', { name: 'Make the token' }));
        const token = await within(dialog).findByLabelText<HTMLInputElement>('Token');
        await expect(token.value).toMatch(/^mcp_/);
        await expect(within(dialog).getByText(/it won’t be shown again/)).toBeVisible();
        await expect(within(dialog).getByRole('button', { name: 'Copy the token' })).toHaveFocus();
    },
};

/** Revoking an app asks first, by its name, and says it will have to be authorized again. */
export const RevokeConnection: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp },
        users: [{ ...ada, connections: [{ name: 'Notes app', type: 'client' }] }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(
            await canvas.findByRole('button', { name: 'Revoke the connection Notes app' }),
        );
        const ask = await body.findByRole('alertdialog', { name: 'Revoke Notes app?' });
        await expect(ask).toHaveTextContent(/authorize it again/);
        await expect(within(ask).getByRole('button', { name: 'Cancel' })).toHaveFocus();
        await userEvent.click(within(ask).getByRole('button', { name: 'Revoke' }));
        await expect(await canvas.findByText('You have no connections yet.')).toBeVisible();
    },
};

/** While the connections load: the skeleton of the list. */
export const ConnectionsLoading: Story = {
    args: {
        auth: { mode: 'panneau', account: true, token: {} },
        agents: { mcp },
        adapter: (adapter) => ({
            ...adapter,
            getAccount: () => new Promise(() => undefined),
            listConnections: () => new Promise(() => undefined),
        }),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('status')[0]).toHaveTextContent('Loading…');
        await expect(canvasElement.querySelectorAll('[aria-busy="true"]')).toHaveLength(2);
    },
};
