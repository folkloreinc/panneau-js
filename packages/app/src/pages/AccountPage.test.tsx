import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LeaveGuardsProvider, createLeaveGuards } from '@panneau/core';
import {
    ApiError,
    type DataAdapter,
    PasswordConfirmationError,
    createRestAdapter,
} from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type Agents, type Auth, validateDefinition } from '@panneau/protocol';
import { type MockUser, createMockBackend } from '@panneau/protocol/mock';
import { PanneauRoot } from '@panneau/ui';

import { createDefinition } from '../__fixtures__/definition';
import { AccountPage } from './AccountPage';

const auth: Auth = { mode: 'panneau', account: true, token: {} };

function renderAccount({
    agents,
    connections,
    adapter: wrap,
}: {
    agents?: Agents;
    connections?: MockUser['connections'];
    adapter?: (adapter: DataAdapter) => DataAdapter;
} = {}) {
    const input = createDefinition({ auth, ...(agents !== undefined && { agents }) });
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error('Invalid definition.');
    }
    const backend = createMockBackend({
        definition: input,
        auth: {
            users: [
                {
                    email: 'ada@example.com',
                    password: 'secret',
                    name: 'Ada Lovelace',
                    ...(connections !== undefined && { connections }),
                },
            ],
        },
    });
    const created = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
    const adapter = wrap?.(created) ?? created;
    const guards = createLeaveGuards();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
        <PanneauRoot>
            <QueryClientProvider client={queryClient}>
                <DataAdapterProvider adapter={adapter}>
                    <LeaveGuardsProvider guards={guards}>
                        <AccountPage definition={result.data} />
                    </LeaveGuardsProvider>
                </DataAdapterProvider>
            </QueryClientProvider>
        </PanneauRoot>,
    );
    return { guards, queryClient };
}

/** Asks the guards whether the page may be left, as the router does. */
async function leave(guards: ReturnType<typeof createLeaveGuards>) {
    let answer: Promise<boolean> = Promise.resolve(true);
    await act(async () => {
        answer = guards.confirmLeave();
        await Promise.resolve();
    });
    // In an object: an async function would wait for the answer it returns
    return { answer };
}

describe('AccountPage', () => {
    describe('profile', () => {
        it('lets the user leave without asking when nothing changed', async () => {
            const { guards } = renderAccount();
            expect(await screen.findByRole('textbox', { name: /^Name/ })).toHaveValue(
                'Ada Lovelace',
            );
            expect(guards.isBlocking()).toBe(false);
            await expect((await leave(guards)).answer).resolves.toBe(true);
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        });

        it('asks before leaving with unsaved changes: "Stay" keeps them', async () => {
            const user = userEvent.setup();
            const { guards } = renderAccount();
            const name = await screen.findByRole('textbox', { name: /^Name/ });
            await user.clear(name);
            await user.type(name, 'Ada King');
            expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

            const { answer } = await leave(guards);
            const ask = await screen.findByRole('alertdialog', { name: 'Leave without saving?' });
            await user.click(within(ask).getByRole('button', { name: 'Stay' }));
            await expect(answer).resolves.toBe(false);
            expect(name).toHaveValue('Ada King');
        });

        it('saves with Ctrl Enter (⌘ Enter on Apple platforms), says so, and no longer asks', async () => {
            const user = userEvent.setup();
            const { guards } = renderAccount();
            const name = await screen.findByRole('textbox', { name: /^Name/ });
            await user.clear(name);
            await user.type(name, 'Ada King');
            await user.keyboard('{Control>}{Enter}{/Control}');
            expect(await screen.findByText('Your account was saved.')).toBeInTheDocument();
            await waitFor(() => expect(guards.isBlocking()).toBe(false));
            expect(name).toHaveValue('Ada King');
        });

        it('shows the errors of the backend under their fields', async () => {
            const user = userEvent.setup();
            renderAccount();
            const email = await screen.findByRole('textbox', { name: /^Email/ });
            await user.clear(email);
            await user.type(email, 'nope');
            await user.click(screen.getByRole('button', { name: 'Save' }));
            expect(
                await screen.findByText('The email field must be a valid email address.'),
            ).toBeInTheDocument();
            expect(email).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('connections', () => {
        const mcp = { url: 'https://example.com/panneau/mcp' };

        it('is hidden without agents.mcp', async () => {
            renderAccount();
            await screen.findByRole('textbox', { name: /^Name/ });
            expect(screen.queryByRole('heading', { name: 'Connections' })).not.toBeInTheDocument();
        });

        it('lists the connections, with the address of the MCP server', async () => {
            renderAccount({
                agents: { mcp },
                connections: [
                    { name: 'Claude', write: true },
                    { name: 'Notes app', type: 'client' },
                ],
            });
            expect(await screen.findByRole('heading', { name: 'Connections' })).toBeVisible();
            expect(screen.getByRole('textbox', { name: 'Address of the MCP server' })).toHaveValue(
                mcp.url,
            );
            const list = await screen.findByRole('list', { name: 'Connections' });
            const [token, client] = within(list).getAllByRole('listitem');
            expect(token).toHaveTextContent('Claude');
            expect(token?.textContent).toMatch(
                /personal token · read and change · made on .* · never expires/,
            );
            expect(client?.textContent).toMatch(/app · read · made on .* · never expires/);
            expect(client).not.toHaveTextContent('last used');
        });

        it('shows the details of a connection in a line that wraps, not in the one-line description', async () => {
            renderAccount({ agents: { mcp }, connections: [{ name: 'Claude', write: true }] });
            const list = await screen.findByRole('list', { name: 'Connections' });
            const details = within(list).getByText(/personal token · read and change/);
            expect(details.tagName).toBe('P');
        });

        it('says when there are none, and offers no token without agents.mcp.tokens', async () => {
            renderAccount({ agents: { mcp } });
            expect(await screen.findByText('You have no connections yet.')).toBeVisible();
            expect(
                screen.queryByRole('button', { name: 'New personal token' }),
            ).not.toBeInTheDocument();
        });

        it('copies the address of the MCP server', async () => {
            const user = userEvent.setup();
            renderAccount({ agents: { mcp } });
            await user.click(
                await screen.findByRole('button', { name: 'Copy the address of the MCP server' }),
            );
            expect(await navigator.clipboard.readText()).toBe(mcp.url);
            expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
        });

        it('makes a personal token, shows it once, and forgets it when closed', async () => {
            const user = userEvent.setup();
            const { queryClient } = renderAccount({ agents: { mcp: { ...mcp, tokens: true } } });
            const open = await screen.findByRole('button', { name: 'New personal token' });
            await user.click(open);
            const dialog = await screen.findByRole('dialog', { name: 'New personal token' });
            await user.type(
                within(dialog).getByRole('textbox', { name: /^Name of the token/ }),
                'Claude',
            );
            const write = within(dialog).getByRole('checkbox', { name: /Can change content/ });
            expect(write).not.toBeChecked();
            await user.click(write);
            await user.click(within(dialog).getByRole('button', { name: 'Make the token' }));

            const token = await within(dialog).findByRole('textbox', { name: 'Token' });
            expect((token as HTMLInputElement).value).toMatch(/^mcp_/);
            expect(within(dialog).getByText(/it won’t be shown again/)).toBeVisible();
            await user.click(within(dialog).getByRole('button', { name: 'Copy the token' }));
            expect(await navigator.clipboard.readText()).toBe((token as HTMLInputElement).value);
            // The token is in no query: only its connection, in the list
            const cached = JSON.stringify(
                queryClient
                    .getQueryCache()
                    .getAll()
                    .map((query) => query.state.data),
            );
            expect(cached).not.toContain((token as HTMLInputElement).value);

            await user.click(within(dialog).getByRole('button', { name: 'Done' }));
            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
            expect(screen.queryByDisplayValue(/^mcp_/)).not.toBeInTheDocument();
            await waitFor(() => expect(open).toHaveFocus());
            const list = await screen.findByRole('list', { name: 'Connections' });
            expect(within(list).getByText('Claude')).toBeInTheDocument();
            expect(within(list).getByText(/read and change/)).toBeInTheDocument();

            // A new dialog starts empty
            await user.click(open);
            const again = await screen.findByRole('dialog', { name: 'New personal token' });
            expect(within(again).getByRole('textbox', { name: /^Name of the token/ })).toHaveValue(
                '',
            );
            expect(within(again).queryByRole('textbox', { name: 'Token' })).not.toBeInTheDocument();
        });

        it('shows the errors of the backend: a missing name, and an account that cannot make tokens', async () => {
            const user = userEvent.setup();
            renderAccount({
                agents: { mcp: { ...mcp, tokens: true } },
                adapter: (adapter) => ({
                    ...adapter,
                    createConnectionToken: async (request, options) => {
                        if (request.name === 'Refused') {
                            throw new ApiError({
                                type: 'about:blank',
                                title: 'Conflict.',
                                status: 409,
                            });
                        }
                        return (
                            adapter.createConnectionToken?.(request, options) ??
                            Promise.reject(new Error('No tokens.'))
                        );
                    },
                }),
            });
            await user.click(await screen.findByRole('button', { name: 'New personal token' }));
            const dialog = await screen.findByRole('dialog', { name: 'New personal token' });
            await user.click(within(dialog).getByRole('button', { name: 'Make the token' }));
            expect(await within(dialog).findByText('The name field is required.')).toBeVisible();

            await user.type(
                within(dialog).getByRole('textbox', { name: /^Name of the token/ }),
                'Refused',
            );
            await user.click(within(dialog).getByRole('button', { name: 'Make the token' }));
            expect(await within(dialog).findByRole('alert')).toHaveTextContent(
                'Your account can’t make personal tokens.',
            );
        });

        it('asks for the password when the backend needs a recent one (423)', async () => {
            const user = userEvent.setup();
            let confirmed = false;
            renderAccount({
                agents: { mcp: { ...mcp, tokens: true } },
                adapter: (adapter) => ({
                    ...adapter,
                    confirmPassword: () => {
                        confirmed = true;
                        return Promise.resolve();
                    },
                    createConnectionToken: (request, options) =>
                        confirmed
                            ? (adapter.createConnectionToken?.(request, options) ??
                              Promise.reject(new Error('No tokens.')))
                            : Promise.reject(
                                  new PasswordConfirmationError({
                                      type: 'urn:panneau:problem:password-confirmation',
                                      title: 'Password confirmation required.',
                                      status: 423,
                                  }),
                              ),
                }),
            });
            await user.click(await screen.findByRole('button', { name: 'New personal token' }));
            const dialog = await screen.findByRole('dialog', { name: 'New personal token' });
            await user.type(
                within(dialog).getByRole('textbox', { name: /^Name of the token/ }),
                'Claude',
            );
            await user.click(within(dialog).getByRole('button', { name: 'Make the token' }));
            const ask = await screen.findByRole('dialog', { name: 'Confirm your password' });
            await user.type(within(ask).getByLabelText(/^Password/), 'secret');
            await user.click(within(ask).getByRole('button', { name: 'Confirm' }));
            expect(await within(dialog).findByRole('textbox', { name: 'Token' })).toBeVisible();
        });

        it('revokes a connection after a confirmation that names it', async () => {
            const user = userEvent.setup();
            renderAccount({
                agents: { mcp },
                connections: [{ name: 'Claude' }, { name: 'Notes app', type: 'client' }],
            });
            await user.click(
                await screen.findByRole('button', { name: 'Revoke the connection Notes app' }),
            );
            const ask = await screen.findByRole('alertdialog', { name: 'Revoke Notes app?' });
            expect(ask).toHaveTextContent('you will have to authorize it again');
            expect(within(ask).getByRole('button', { name: 'Cancel' })).toHaveFocus();
            await user.click(within(ask).getByRole('button', { name: 'Revoke' }));

            await waitFor(() => expect(screen.queryByText('Notes app')).not.toBeInTheDocument());
            expect(screen.getByText('Claude')).toBeInTheDocument();
            expect(screen.getByRole('list', { name: 'Connections' }).parentElement).toHaveFocus();
        });

        it('keeps a connection when the confirmation is cancelled', async () => {
            const user = userEvent.setup();
            renderAccount({ agents: { mcp }, connections: [{ name: 'Claude' }] });
            await user.click(
                await screen.findByRole('button', { name: 'Revoke the connection Claude' }),
            );
            const ask = await screen.findByRole('alertdialog', { name: 'Revoke Claude?' });
            expect(ask).toHaveTextContent('The agents that use this token will no longer get in.');
            await user.click(within(ask).getByRole('button', { name: 'Cancel' }));
            await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
            expect(screen.getByText('Claude')).toBeInTheDocument();
        });
    });
});
