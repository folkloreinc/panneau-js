import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LeaveGuardsProvider, createLeaveGuards } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type Auth, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';
import { PanneauRoot } from '@panneau/ui';

import { createDefinition } from '../__fixtures__/definition';
import { AccountPage } from './AccountPage';

const auth: Auth = { mode: 'panneau', account: true, token: {} };

function renderAccount() {
    const input = createDefinition({ auth });
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error('Invalid definition.');
    }
    const backend = createMockBackend({
        definition: input,
        auth: { users: [{ email: 'ada@example.com', password: 'secret', name: 'Ada Lovelace' }] },
    });
    const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
    const guards = createLeaveGuards();
    render(
        <PanneauRoot>
            <QueryClientProvider
                client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            >
                <DataAdapterProvider adapter={adapter}>
                    <LeaveGuardsProvider guards={guards}>
                        <AccountPage definition={result.data} />
                    </LeaveGuardsProvider>
                </DataAdapterProvider>
            </QueryClientProvider>
        </PanneauRoot>,
    );
    return { guards };
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
});
