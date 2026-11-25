import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type Auth, validateBootConfig } from '@panneau/protocol';
import { type MockUser, createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';
import type * as Location from './location';
import { loadPage } from './location';

vi.mock('./location', async (original) => ({
    ...(await original<typeof Location>()),
    loadPage: vi.fn(),
}));

const ada: MockUser = { email: 'ada@example.com', password: 'secret', name: 'Ada' };
const NEXT = '/oauth/authorize?client_id=abc&redirect_uri=http%3A%2F%2Flocalhost%3A3000&scope=mcp';

/** The app at `path`, on the mock backend, in `panneau` auth mode. */
function renderAt(
    path: string,
    {
        auth = { mode: 'panneau' },
        users = [ada],
        loggedIn = null,
    }: { auth?: Auth; users?: MockUser[]; loggedIn?: string | null } = {},
) {
    const backend = createMockBackend({
        definition: createDefinition({ auth }),
        auth: { users, loggedIn },
    });
    window.history.replaceState(null, '', path);
    const result = validateBootConfig(createBootConfig({ auth }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            onUnauthorized={vi.fn()}
        />,
    );
}

const withNext = (next: string) => `/panneau?next=${encodeURIComponent(next)}`;

async function logIn(user: ReturnType<typeof userEvent.setup>) {
    await user.type(await screen.findByLabelText(/^Email/), 'ada@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('the next of the login (#508)', () => {
    beforeEach(() => {
        vi.mocked(loadPage).mockClear();
        window.sessionStorage.clear();
    });

    afterEach(() => {
        window.sessionStorage.clear();
    });

    it('goes to next with a full load once a guest logged in with a password', async () => {
        const user = userEvent.setup();
        renderAt(withNext(NEXT));
        expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
        expect(loadPage).not.toHaveBeenCalled();

        await logIn(user);
        await waitFor(() => expect(loadPage).toHaveBeenCalledWith(NEXT));
        expect(loadPage).toHaveBeenCalledTimes(1);
        // The shell doesn't show while the browser leaves.
        expect(screen.queryByRole('heading', { name: 'Test site' })).not.toBeInTheDocument();
    });

    it('goes to next after the second factor, not before', async () => {
        const user = userEvent.setup();
        renderAt(withNext(NEXT), {
            auth: { mode: 'panneau', twoFactor: true },
            users: [{ ...ada, twoFactor: true, recoveryCodes: ['abcde-12345'] }],
        });
        await logIn(user);
        expect(
            await screen.findByRole('heading', { name: 'Two-factor authentication' }),
        ).toBeInTheDocument();
        expect(loadPage).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Use a recovery code' }));
        await user.type(screen.getByLabelText(/^Recovery code/), 'abcde-12345');
        await user.click(screen.getByRole('button', { name: 'Verify' }));
        await waitFor(() => expect(loadPage).toHaveBeenCalledWith(NEXT));
        expect(loadPage).toHaveBeenCalledTimes(1);
    });

    it('goes to next once a guest logged in with a passkey', async () => {
        class FakeCredential {
            constructor(readonly id: string) {}
            toJSON() {
                return { id: this.id, rawId: this.id, type: 'public-key', response: {} };
            }
        }
        vi.stubGlobal('PublicKeyCredential', FakeCredential);
        Object.defineProperty(navigator, 'credentials', {
            value: { get: vi.fn(() => Promise.resolve(new FakeCredential('cred-1'))) },
            configurable: true,
        });
        try {
            const user = userEvent.setup();
            renderAt(withNext(NEXT), {
                auth: { mode: 'panneau', passkeys: true },
                users: [{ ...ada, passkeys: [{ id: 'cred-1', name: 'Laptop' }] }],
            });
            await user.click(await screen.findByRole('button', { name: 'Log in with a passkey' }));
            await waitFor(() => expect(loadPage).toHaveBeenCalledWith(NEXT));
        } finally {
            vi.unstubAllGlobals();
            Reflect.deleteProperty(navigator, 'credentials');
        }
    });

    it('sends the providers back to the app with its next, which then goes there', async () => {
        renderAt(withNext(NEXT), {
            auth: {
                mode: 'panneau',
                providers: [
                    {
                        id: 'google',
                        label: 'Google',
                        url: '/panneau/api/auth/providers/google/redirect',
                    },
                ],
            },
        });
        expect(await screen.findByRole('link', { name: 'Log in with Google' })).toHaveAttribute(
            'href',
            // The path under the base path that the backend follows (decision 0052), with next
            `/panneau/api/auth/providers/google/redirect?next=${encodeURIComponent(withNext(NEXT))}`,
        );
    });

    it('goes to next right away when the user is already logged in', async () => {
        renderAt(withNext(NEXT), { loggedIn: 'ada@example.com' });
        await waitFor(() => expect(loadPage).toHaveBeenCalledWith(NEXT));
        expect(loadPage).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
    });

    it('stays, once, when next sent a logged-in user back a moment ago', async () => {
        const first = renderAt(withNext(NEXT), { loggedIn: 'ada@example.com' });
        await waitFor(() => expect(loadPage).toHaveBeenCalledTimes(1));
        // The target sends the user back with the same next, in a new page load.
        first.unmount();
        renderAt(withNext(NEXT), { loggedIn: 'ada@example.com' });
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(loadPage).toHaveBeenCalledTimes(1);
        expect(window.location.search).toBe('');
    });

    it.each([
        ['//evil.example/oauth/authorize'],
        ['/\\evil.example'],
        ['https://evil.example/oauth/authorize'],
        ['javascript:alert(1)'],
        ['/\t/evil.example'],
    ])('ignores the unsafe next %j', async (next) => {
        const user = userEvent.setup();
        renderAt(withNext(next));
        await logIn(user);
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(loadPage).not.toHaveBeenCalled();
    });

    it('ignores an unsafe next for a logged-in user', async () => {
        renderAt(withNext('//evil.example'), { loggedIn: 'ada@example.com' });
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(loadPage).not.toHaveBeenCalled();
    });
});
