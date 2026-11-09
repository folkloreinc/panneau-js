import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useIntl } from 'react-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PanneauPlugin, definePlugin } from '@panneau/core';
import {
    type DataAdapter,
    ForbiddenError,
    NetworkError,
    UnauthorizedError,
    ValidationError,
    createRestAdapter,
} from '@panneau/data';
import { queryKeys } from '@panneau/data/query';
import {
    type Auth,
    type BootConfigInput,
    type DefinitionInput,
    validateBootConfig,
} from '@panneau/protocol';
import { type MockMail, type MockUser, createMockBackend } from '@panneau/protocol/mock';

import { Panneau, type PanneauProps } from './Panneau';
import { createBootConfig, createDefinition } from './__fixtures__/definition';

function parse(input: BootConfigInput) {
    const result = validateBootConfig(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return result.data;
}

const unauthorized = () =>
    new UnauthorizedError({ type: 'about:blank', title: 'Unauthenticated.', status: 401 });

function createAdapter(getDefinition: () => Promise<unknown>) {
    return { getDefinition: vi.fn(getDefinition) } as Partial<DataAdapter> as DataAdapter & {
        getDefinition: ReturnType<typeof vi.fn>;
    };
}

const navigation = () => within(screen.getByRole('navigation', { name: 'Main navigation' }));

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPanneau(
    props: Omit<Partial<PanneauProps>, 'config'> & { config?: BootConfigInput } = {},
) {
    const { config = createBootConfig(), ...rest } = props;
    return render(<Panneau onUnauthorized={vi.fn()} {...rest} config={parse(config)} />);
}

describe('Panneau', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau');
    });

    it('fetches the definition, then renders the shell', async () => {
        const adapter = createAdapter(() =>
            Promise.resolve(parse(createBootConfig({ definition: createDefinition() })).definition),
        );
        renderPanneau({ adapter });
        // The shell's skeleton, until the definition is there.
        expect(screen.getByRole('status')).toHaveTextContent('Loading…');
        expect(document.querySelector('[aria-busy="true"] .panneau-skeleton')).not.toBeNull();
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(navigation().getByRole('link', { name: 'Pages' })).toHaveAttribute(
            'href',
            '/panneau/resources/pages',
        );
        expect(adapter.getDefinition).toHaveBeenCalledTimes(1);
    });

    it('uses the inlined definition without fetching it', () => {
        const adapter = createAdapter(() => Promise.reject(new Error('Not called.')));
        renderPanneau({ adapter, config: createBootConfig({ definition: createDefinition() }) });
        expect(screen.getByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        expect(adapter.getDefinition).not.toHaveBeenCalled();
    });

    it('takes the density of the definition’s theme, auto by default', () => {
        const adapter = createAdapter(() => Promise.reject(new Error('Not called.')));
        const { container, unmount } = renderPanneau({
            adapter,
            config: createBootConfig({
                definition: { ...createDefinition(), theme: { density: 'touch' } },
            }),
        });
        expect(container.querySelector('.panneau-root')).toHaveAttribute('data-density', 'touch');
        unmount();
        const other = renderPanneau({
            adapter,
            config: createBootConfig({ definition: createDefinition() }),
        });
        expect(other.container.querySelector('.panneau-root')).toHaveAttribute(
            'data-density',
            'auto',
        );
    });

    it('navigates between routes under the base path, in history mode', async () => {
        const user = userEvent.setup();
        renderPanneau({
            adapter: createAdapter(() => Promise.reject(new Error('Not called.'))),
            config: createBootConfig({ definition: createDefinition() }),
        });
        await user.click(navigation().getByRole('link', { name: 'Authors' }));
        expect(window.location.pathname).toBe('/panneau/resources/authors');
        expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
        expect(navigation().getByRole('link', { name: 'Authors' })).toHaveAttribute(
            'aria-current',
            'page',
        );

        await act(async () => {
            window.history.back();
            await new Promise((resolve) =>
                window.addEventListener('popstate', resolve, { once: true }),
            );
        });
        expect(screen.getByRole('heading', { name: 'Test site' })).toBeInTheDocument();
    });

    it('shows the route of the page it was loaded on', () => {
        window.history.replaceState(null, '', '/panneau/resources/pages/12/edit');
        renderPanneau({
            adapter: createAdapter(() => Promise.reject(new Error('Not called.'))),
            config: createBootConfig({ definition: createDefinition() }),
        });
        expect(screen.getByRole('heading', { name: 'Edit the page' })).toBeInTheDocument();
        expect(
            within(screen.getByRole('main')).getByRole('link', { name: 'Pages' }),
        ).toHaveAttribute('href', '/panneau/resources/pages');
    });

    it('shows an error with a retry when the definition fails to load', async () => {
        const user = userEvent.setup();
        let calls = 0;
        const adapter = createAdapter(() => {
            calls += 1;
            return calls === 1
                ? Promise.reject(new Error('Network error'))
                : Promise.resolve(
                      parse(createBootConfig({ definition: createDefinition() })).definition,
                  );
        });
        renderPanneau({
            adapter,
            queryClient: createQueryClient(),
        });
        expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
        await user.click(screen.getByRole('button', { name: 'Try again' }));
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
    });

    it('says when the user isn’t allowed in, without a retry', async () => {
        const adapter = createAdapter(() =>
            Promise.reject(
                new ForbiddenError({ type: 'about:blank', title: 'Forbidden', status: 403 }),
            ),
        );
        renderPanneau({ adapter, queryClient: createQueryClient() });
        expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    });

    it('says when the server can’t be reached, and tries again once the browser is online', async () => {
        let calls = 0;
        const adapter = createAdapter(() => {
            calls += 1;
            return calls === 1
                ? Promise.reject(new NetworkError())
                : Promise.resolve(
                      parse(createBootConfig({ definition: createDefinition() })).definition,
                  );
        });
        renderPanneau({ adapter, queryClient: createQueryClient() });
        expect(
            await screen.findByRole('heading', { name: 'The server can’t be reached' }),
        ).toBeInTheDocument();
        act(() => {
            window.dispatchEvent(new Event('online'));
        });
        expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
    });

    describe('the home route', () => {
        function Overview({ title }: { title: string }) {
            return <h1>{title}</h1>;
        }
        const plugins = [definePlugin({ id: 'overview', pages: { overview: Overview } })];

        it('renders pages.home of the definition', () => {
            renderPanneau({
                plugins,
                config: createBootConfig({
                    definition: createDefinition({
                        pages: {
                            home: {
                                component: 'overview',
                                label: 'Overview',
                                props: { title: 'Server health' },
                            },
                        },
                    }),
                }),
            });
            expect(screen.getByRole('heading', { name: 'Server health' })).toBeInTheDocument();
            expect(screen.queryByText('Welcome, Ada.')).not.toBeInTheDocument();
            expect(navigation().getByRole('link', { name: 'Home' })).toHaveAttribute(
                'aria-current',
                'page',
            );
            expect(document.title).toBe('Overview · Test site');
        });

        it('shows the cards of the resources for the built-in dashboard', () => {
            renderPanneau({
                config: createBootConfig({
                    definition: createDefinition({ pages: { home: { component: 'dashboard' } } }),
                }),
            });
            expect(
                within(screen.getByRole('main')).getByRole('link', { name: 'Pages' }),
            ).toHaveAttribute('href', '/panneau/resources/pages');
        });

        it('says when no plugin provides the component of pages.home', () => {
            renderPanneau({
                config: createBootConfig({
                    definition: createDefinition({ pages: { home: { component: 'overview' } } }),
                }),
            });
            const main = within(screen.getByRole('main'));
            expect(main.getByText(/overview/)).toBeInTheDocument();
            expect(main.queryByRole('link', { name: 'Authors' })).not.toBeInTheDocument();
        });
    });

    describe('the messages of plugins', () => {
        function Overview() {
            const intl = useIntl();
            return (
                <h1>
                    {intl.formatMessage({ id: 'overview.title', defaultMessage: 'Server health' })}
                </h1>
            );
        }

        function renderWithMessages(locales: PanneauPlugin['locales']) {
            renderPanneau({
                plugins: [definePlugin({ id: 'overview', pages: { overview: Overview }, locales })],
                config: createBootConfig({
                    locale: 'fr',
                    definition: createDefinition({
                        locale: 'fr-CA',
                        pages: { home: { component: 'overview' } },
                    }),
                }),
            });
        }

        it('loads them in the locale of the definition, over Panneau’s, before the shell', async () => {
            renderWithMessages({
                fr: () => Promise.resolve({ default: { 'overview.title': 'Santé du serveur' } }),
                en: () => Promise.reject(new Error('Not loaded.')),
            });
            // The shell's skeleton, until the messages are there.
            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(
                await screen.findByRole('heading', { name: 'Santé du serveur' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument();
        });

        it('renders the shell with the default messages when they fail to load', async () => {
            const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            renderWithMessages({ fr: () => Promise.reject(new Error('Network error')) });
            expect(
                await screen.findByRole('heading', { name: 'Server health' }),
            ).toBeInTheDocument();
            expect(error).toHaveBeenCalledWith(
                expect.stringContaining('failed to load'),
                expect.any(Error),
            );
            error.mockRestore();
        });
    });

    describe('when the API answers that the user is not authenticated', () => {
        it('sends the user to the boot config’s login URL before the definition is loaded', async () => {
            const onUnauthorized = vi.fn();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ loginUrl: '/login' }),
                onUnauthorized,
            });
            expect(await screen.findByRole('alert')).toHaveTextContent('Your session has ended.');
            expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ loginUrl: '/login' });
        });

        it('uses auth.loginUrl of the definition in external mode', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition: createDefinition(), loginUrl: '/login' }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(screen.getByRole('alert')).toHaveTextContent('Your session has ended.');
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({
                loginUrl: '/login?from=definition',
            });
        });

        it('has no login URL in panneau mode, whose login page is in the app', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            const definition: DefinitionInput = createDefinition({ auth: { mode: 'panneau' } });
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition, loginUrl: '/login' }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
            expect(onUnauthorized).toHaveBeenCalledExactlyOnceWith({ loginUrl: null });
        });

        it('calls onUnauthorized once for several failed calls', async () => {
            const onUnauthorized = vi.fn();
            const queryClient = createQueryClient();
            renderPanneau({
                adapter: createAdapter(() => Promise.reject(unauthorized())),
                config: createBootConfig({ definition: createDefinition() }),
                queryClient,
                onUnauthorized,
            });
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(onUnauthorized).toHaveBeenCalledTimes(1);
        });
    });

    describe('in panneau auth mode', () => {
        const auth = { mode: 'panneau' as const };
        function definition() {
            const inlined = parse(
                createBootConfig({ definition: createDefinition({ auth }) }),
            ).definition;
            if (inlined === undefined) {
                throw new Error('No definition.');
            }
            return inlined;
        }

        function createAuthAdapter(overrides: Partial<DataAdapter> = {}) {
            return {
                getDefinition: vi.fn(() => Promise.resolve(definition())),
                list: vi.fn(() =>
                    Promise.resolve({
                        data: [],
                        meta: { page: 1, perPage: 15, total: 0, lastPage: 1 },
                    }),
                ),
                login: vi.fn(() => Promise.resolve({ user: { id: 'usr_1', name: 'Ada' } })),
                logout: vi.fn(() => Promise.resolve()),
                ...overrides,
            } as Partial<DataAdapter> as DataAdapter & {
                getDefinition: ReturnType<typeof vi.fn>;
                login: ReturnType<typeof vi.fn>;
                logout: ReturnType<typeof vi.fn>;
            };
        }

        it('shows the login page of the boot config before the definition, then the shell', async () => {
            const user = userEvent.setup();
            let calls = 0;
            const adapter = createAuthAdapter({
                getDefinition: vi.fn(() => {
                    calls += 1;
                    return calls === 1
                        ? Promise.reject(unauthorized())
                        : Promise.resolve(definition());
                }),
            });
            renderPanneau({
                adapter,
                queryClient: createQueryClient(),
                config: createBootConfig({
                    auth: {
                        mode: 'panneau',
                        token: { label: 'Admin token', help: 'ADMIN_TOKEN of the server.' },
                    },
                }),
            });
            const token = await screen.findByLabelText(/^Admin token/);
            expect(screen.getByText('ADMIN_TOKEN of the server.')).toBeInTheDocument();
            // A token login only: no email.
            expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
            expect(screen.queryByText(/session has ended/)).not.toBeInTheDocument();
            await user.type(token, 's3cret');
            await user.click(screen.getByRole('button', { name: 'Log in' }));
            expect(adapter.login).toHaveBeenCalledWith({ token: 's3cret' });
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        });

        it('shows the errors of the backend under the fields, or above the form', async () => {
            const user = userEvent.setup();
            const invalid = (errors: Record<string, string[]>) =>
                new ValidationError({
                    type: 'about:blank',
                    title: 'These credentials do not match our records.',
                    status: 422,
                    errors,
                });
            const adapter = createAuthAdapter({
                getDefinition: vi.fn(() => Promise.reject(unauthorized())),
                login: vi
                    .fn()
                    .mockRejectedValueOnce(
                        invalid({ email: ['These credentials do not match our records.'] }),
                    )
                    .mockRejectedValueOnce(invalid({}))
                    .mockRejectedValueOnce(new Error('Network error')),
            });
            renderPanneau({
                adapter,
                queryClient: createQueryClient(),
                config: createBootConfig({ auth }),
            });
            await user.type(await screen.findByLabelText(/^Email/), 'ada@example.com');
            await user.type(screen.getByLabelText(/^Password/), 'wrong');
            await user.click(screen.getByRole('checkbox', { name: 'Remember me' }));
            const submit = screen.getByRole('button', { name: 'Log in' });

            await user.click(submit);
            expect(adapter.login).toHaveBeenLastCalledWith({
                email: 'ada@example.com',
                password: 'wrong',
                remember: true,
            });
            expect(await screen.findByLabelText(/^Email/)).toHaveAccessibleDescription(
                'These credentials do not match our records.',
            );
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

            await user.click(submit);
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'These credentials do not match our records.',
            );

            await user.click(submit);
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'You could not be logged in.',
            );
        });

        it('shows the login page when the session ends, then the page the user was on', async () => {
            const user = userEvent.setup();
            const queryClient = createQueryClient();
            const adapter = createAuthAdapter();
            window.history.replaceState(null, '', '/panneau/resources/pages');
            renderPanneau({
                adapter,
                queryClient,
                config: createBootConfig({ definition: definition() }),
            });
            adapter.getDefinition.mockRejectedValueOnce(unauthorized());
            await act(() => queryClient.refetchQueries({ queryKey: queryKeys.definition() }));
            expect(
                screen.getByText('Your session has ended. Log in again to continue.'),
            ).toBeInTheDocument();
            expect(screen.getByText('Test site')).toBeInTheDocument();

            await user.type(screen.getByLabelText(/^Email/), 'ada@example.com');
            await user.type(screen.getByLabelText(/^Password/), 'secret');
            await user.click(screen.getByRole('button', { name: 'Log in' }));
            expect(await screen.findByRole('heading', { name: 'Pages' })).toBeInTheDocument();
            expect(window.location.pathname).toBe('/panneau/resources/pages');
        });

        it('logs out, forgets the user, and fetches the definition at the next login', async () => {
            const user = userEvent.setup();
            const queryClient = createQueryClient();
            const adapter = createAuthAdapter();
            renderPanneau({
                adapter,
                queryClient,
                config: createBootConfig({ definition: definition() }),
            });
            expect(adapter.getDefinition).not.toHaveBeenCalled();

            await user.click(screen.getByRole('button', { name: 'Log out' }));
            expect(adapter.logout).toHaveBeenCalledTimes(1);
            expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
            expect(screen.queryByText(/session has ended/)).not.toBeInTheDocument();
            expect(queryClient.getQueryData(queryKeys.definition())).toBeUndefined();

            await user.type(screen.getByLabelText(/^Email/), 'grace@example.com');
            await user.type(screen.getByLabelText(/^Password/), 'secret');
            await user.click(screen.getByRole('button', { name: 'Log in' }));
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
            expect(adapter.getDefinition).toHaveBeenCalledTimes(1);
        });

        it('says when the logout fails, and stays', async () => {
            const user = userEvent.setup();
            const adapter = createAuthAdapter({
                logout: vi.fn(() => Promise.reject(new Error('Network error'))),
            });
            renderPanneau({
                adapter,
                queryClient: createQueryClient(),
                config: createBootConfig({ definition: definition() }),
            });
            await user.click(screen.getByRole('button', { name: 'Log out' }));
            expect(
                await screen.findByText('You could not be logged out. Try again.'),
            ).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        });
    });

    describe('the auth pages: password reset, email verification, two-factor', () => {
        /** The app on the mock backend, with its users and the emails it "sends". */
        function renderWithBackend(
            auth: Auth,
            users: MockUser[],
            options: { loggedIn?: string | null; mails?: MockMail[] } = {},
        ) {
            const backend = createMockBackend({
                definition: createDefinition({ auth }),
                auth: {
                    users,
                    ...(options.loggedIn !== undefined ? { loggedIn: options.loggedIn } : {}),
                    onMail: (mail) => options.mails?.push(mail),
                },
            });
            const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
            const renderAt = (path: string) => {
                window.history.replaceState(null, '', path);
                return renderPanneau({
                    adapter,
                    queryClient: createQueryClient(),
                    config: createBootConfig({ auth }),
                });
            };
            return { renderAt };
        }

        const ada = { email: 'ada@example.com', password: 'secret', name: 'Ada' };

        it('resets a forgotten password through the link of its email, then logs in', async () => {
            const user = userEvent.setup();
            const mails: MockMail[] = [];
            const { renderAt } = renderWithBackend(
                { mode: 'panneau', passwordReset: true },
                [ada],
                {
                    loggedIn: null,
                    mails,
                },
            );
            const first = renderAt('/panneau');
            await user.click(await screen.findByRole('button', { name: 'Forgot your password?' }));
            expect(
                screen.getByRole('heading', { name: 'Reset your password' }),
            ).toBeInTheDocument();
            await user.type(screen.getByLabelText(/^Email/), 'ada@example.com');
            await user.click(screen.getByRole('button', { name: 'Send the link' }));
            expect(
                await screen.findByText(/a link to choose a new password is on its way/),
            ).toBeInTheDocument();
            const [mail] = mails;
            expect(mail).toMatchObject({ kind: 'password-reset', to: 'ada@example.com' });
            first.unmount();

            // The link of the email
            renderAt(`/panneau/${mail?.path ?? ''}`);
            expect(
                await screen.findByRole('heading', { name: 'Choose a new password' }),
            ).toBeInTheDocument();
            expect(screen.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
            await user.type(screen.getByLabelText(/^New password/), 'new password');
            await user.type(screen.getByLabelText(/^Confirm the new password/), 'other password');
            await user.click(screen.getByRole('button', { name: 'Change the password' }));
            expect(screen.getByLabelText(/^Confirm the new password/)).toHaveAccessibleDescription(
                'The two passwords are different.',
            );
            await user.clear(screen.getByLabelText(/^Confirm the new password/));
            await user.type(screen.getByLabelText(/^Confirm the new password/), 'new password');
            await user.click(screen.getByRole('button', { name: 'Change the password' }));

            // The login page, with the email of the reset
            expect(
                await screen.findByText(
                    'Your password was changed. Log in with your new password.',
                ),
            ).toBeInTheDocument();
            expect(window.location.pathname).toBe('/panneau');
            expect(screen.getByLabelText(/^Email/)).toHaveValue('ada@example.com');
            await user.type(screen.getByLabelText(/^Password/), 'new password');
            await user.click(screen.getByRole('button', { name: 'Log in' }));
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        });

        it('shows the error of a reset link that no longer works', async () => {
            const user = userEvent.setup();
            const { renderAt } = renderWithBackend({ mode: 'panneau', passwordReset: true }, [ada]);
            renderAt('/panneau/auth/reset-password?token=used&email=ada%40example.com');
            await user.type(await screen.findByLabelText(/^New password/), 'new password');
            await user.type(screen.getByLabelText(/^Confirm the new password/), 'new password');
            await user.click(screen.getByRole('button', { name: 'Change the password' }));
            expect(await screen.findByLabelText(/^Email/)).toHaveAccessibleDescription(
                'This password reset token is invalid.',
            );
        });

        it('has no "Forgot your password?" link without auth.passwordReset', async () => {
            const { renderAt } = renderWithBackend({ mode: 'panneau' }, [ada], { loggedIn: null });
            renderAt('/panneau');
            expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
            expect(
                screen.queryByRole('button', { name: 'Forgot your password?' }),
            ).not.toBeInTheDocument();
        });

        it('asks a user to verify their address, then verifies it through the link', async () => {
            const user = userEvent.setup();
            const mails: MockMail[] = [];
            const { renderAt } = renderWithBackend(
                { mode: 'panneau', emailVerification: true },
                [{ ...ada, emailVerified: false }],
                { mails },
            );
            const first = renderAt('/panneau/resources/pages');
            expect(
                await screen.findByRole('heading', { name: 'Verify your email address' }),
            ).toBeInTheDocument();
            expect(mails).toEqual([]);
            await user.click(screen.getByRole('button', { name: 'Send a new link' }));
            expect(await screen.findByText(/A new link is on its way/)).toBeInTheDocument();
            const [mail] = mails;
            expect(mail).toMatchObject({ kind: 'email-verification', to: 'ada@example.com' });
            first.unmount();

            renderAt(`/panneau/${mail?.path ?? ''}`);
            expect(await screen.findByText('Your email address is verified.')).toBeInTheDocument();
            await user.click(screen.getByRole('button', { name: 'Continue' }));
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
            expect(window.location.pathname).toBe('/panneau');
        });

        it('asks for the second factor of a password login', async () => {
            const user = userEvent.setup();
            const { renderAt } = renderWithBackend(
                { mode: 'panneau', twoFactor: true },
                [{ ...ada, twoFactor: true, recoveryCodes: ['abcde-12345'] }],
                { loggedIn: null },
            );
            renderAt('/panneau');
            await user.type(await screen.findByLabelText(/^Email/), 'ada@example.com');
            await user.type(screen.getByLabelText(/^Password/), 'secret');
            await user.click(screen.getByRole('button', { name: 'Log in' }));

            expect(
                await screen.findByRole('heading', { name: 'Two-factor authentication' }),
            ).toBeInTheDocument();
            await user.type(screen.getByLabelText(/^Code/), '000000');
            await user.click(screen.getByRole('button', { name: 'Verify' }));
            expect(await screen.findByLabelText(/^Code/)).toHaveAccessibleDescription(
                'This code is invalid.',
            );
            // A recovery code instead
            await user.click(screen.getByRole('button', { name: 'Use a recovery code' }));
            await user.type(screen.getByLabelText(/^Recovery code/), 'abcde-12345');
            await user.click(screen.getByRole('button', { name: 'Verify' }));
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        });

        it('sets up the two-factor authentication that a user must have, then loads', async () => {
            const user = userEvent.setup();
            const { renderAt } = renderWithBackend({ mode: 'panneau', twoFactor: true }, [
                { ...ada, twoFactorRequired: true },
            ]);
            renderAt('/panneau');
            await user.click(
                await screen.findByRole('button', { name: 'Set up two-factor authentication' }),
            );
            expect(await screen.findByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument();
            expect(
                screen.getByRole('link', { name: 'Open in an authenticator app' }),
            ).toHaveAttribute('href', expect.stringMatching(/^otpauth:\/\/totp\//));
            await user.type(screen.getByLabelText(/^Code/), '123456');
            await user.click(screen.getByRole('button', { name: 'Confirm' }));

            const codes = await screen.findByRole('list', { name: 'Recovery codes' });
            expect(within(codes).getAllByRole('listitem')).toHaveLength(8);
            await user.click(screen.getByRole('button', { name: 'Done' }));
            expect(await screen.findByRole('heading', { name: 'Test site' })).toBeInTheDocument();
        });

        it('saves the account, changes the password and sets up two-factor authentication', async () => {
            const user = userEvent.setup();
            const { renderAt } = renderWithBackend(
                { mode: 'panneau', account: true, twoFactor: true },
                [ada],
            );
            renderAt('/panneau');
            await screen.findByRole('heading', { name: 'Test site' });
            const profile = screen
                .getAllByRole('link')
                .find((link) => link.getAttribute('href') === '/panneau/account');
            expect(profile).toHaveTextContent('Ada');
            await user.click(profile ?? document.body);
            expect(
                await screen.findByRole('heading', { level: 1, name: 'Your account' }),
            ).toBeInTheDocument();
            expect(window.location.pathname).toBe('/panneau/account');

            const name = await screen.findByLabelText(/^Name/);
            await user.clear(name);
            await user.type(name, 'Ada Lovelace');
            await user.click(screen.getByRole('button', { name: 'Save' }));
            expect(await screen.findByText('Your account was saved.')).toBeInTheDocument();
            await waitFor(() => expect(profile).toHaveTextContent('Ada Lovelace'));

            await user.type(screen.getByLabelText(/^Current password/), 'wrong');
            await user.type(screen.getByLabelText(/^New password/), 'new password');
            await user.type(screen.getByLabelText(/^Confirm the new password/), 'new password');
            await user.click(screen.getByRole('button', { name: 'Change the password' }));
            expect(await screen.findByLabelText(/^Current password/)).toHaveAccessibleDescription(
                'The provided password does not match your current password.',
            );
            await user.clear(screen.getByLabelText(/^Current password/));
            await user.type(screen.getByLabelText(/^Current password/), 'secret');
            await user.click(screen.getByRole('button', { name: 'Change the password' }));
            expect(await screen.findByText('Your password was changed.')).toBeInTheDocument();
            expect(screen.getByLabelText(/^Current password/)).toHaveValue('');

            await user.click(
                await screen.findByRole('button', { name: 'Set up two-factor authentication' }),
            );
            await user.type(await screen.findByLabelText(/^Code/), '123456');
            await user.click(screen.getByRole('button', { name: 'Confirm' }));
            await user.click(await screen.findByRole('button', { name: 'Done' }));
            expect(await screen.findByText('Two-factor authentication is on.')).toBeInTheDocument();
            await user.click(screen.getByRole('button', { name: 'Turn it off' }));
            expect(
                await screen.findByRole('button', { name: 'Set up two-factor authentication' }),
            ).toBeInTheDocument();
        });

        it('adds a passkey on the account page, then logs in with it', async () => {
            // The browser's WebAuthn, with a credential that has `toJSON()`
            class FakeCredential {
                constructor(readonly id: string) {}
                toJSON() {
                    return { id: this.id, rawId: this.id, type: 'public-key', response: {} };
                }
            }
            const credentials = {
                create: vi.fn(() => Promise.resolve(new FakeCredential('cred-1'))),
                get: vi.fn(() => Promise.resolve(new FakeCredential('cred-1'))),
            };
            vi.stubGlobal('PublicKeyCredential', FakeCredential);
            Object.defineProperty(navigator, 'credentials', {
                value: credentials,
                configurable: true,
            });
            try {
                const user = userEvent.setup();
                const { renderAt } = renderWithBackend(
                    { mode: 'panneau', account: true, passkeys: true },
                    [ada],
                );
                renderAt('/panneau/account');
                expect(await screen.findByText('You have no passkeys yet.')).toBeInTheDocument();
                const name = screen.getByLabelText(/^Name of the passkey/);
                await user.clear(name);
                await user.type(name, 'Laptop');
                await user.click(screen.getByRole('button', { name: 'Add a passkey' }));
                const list = await screen.findByRole('list', { name: 'Passkeys' });
                expect(within(list).getByText('Laptop')).toBeInTheDocument();
                expect(credentials.create).toHaveBeenCalledTimes(1);

                await user.click(screen.getByRole('button', { name: 'Log out' }));
                await user.click(
                    await screen.findByRole('button', { name: 'Log in with a passkey' }),
                );
                expect(
                    await screen.findByRole('heading', { level: 1, name: 'Your account' }),
                ).toBeInTheDocument();
                expect(credentials.get).toHaveBeenCalledTimes(1);
            } finally {
                vi.unstubAllGlobals();
                Reflect.deleteProperty(navigator, 'credentials');
            }
        });

        it('says why a login with a provider failed, and comes back to the page with next', async () => {
            const { renderAt } = renderWithBackend(
                {
                    mode: 'panneau',
                    providers: [
                        {
                            id: 'google',
                            label: 'Google',
                            url: '/panneau/api/auth/providers/google/redirect',
                        },
                    ],
                },
                [ada],
                { loggedIn: null },
            );
            renderAt('/panneau/resources/pages?authError=domain');
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'Your email address isn’t allowed here.',
            );
            expect(window.location.search).toBe('');
            expect(screen.getByRole('link', { name: 'Log in with Google' })).toHaveAttribute(
                'href',
                '/panneau/api/auth/providers/google/redirect?next=%2Fpanneau%2Fresources%2Fpages',
            );
        });

        it('says what a provider failed with when the code is unknown', async () => {
            const { renderAt } = renderWithBackend({ mode: 'panneau' }, [ada], { loggedIn: null });
            renderAt('/panneau?authError=something');
            expect(await screen.findByRole('alert')).toHaveTextContent(
                'The login with your account didn’t work. Try again.',
            );
        });

        it('says when a verification link is wrong', async () => {
            const { renderAt } = renderWithBackend({ mode: 'panneau', emailVerification: true }, [
                ada,
            ]);
            renderAt('/panneau/auth/verify-email?token=wrong');
            expect(
                await screen.findByText('This verification link is invalid or has expired.'),
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
        });
    });

    describe('in external auth mode', () => {
        it('offers no logout without auth.logoutUrl', () => {
            renderPanneau({ config: createBootConfig({ definition: createDefinition() }) });
            expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
        });

        it('offers a logout with auth.logoutUrl', () => {
            // The button sends the browser to the URL, which jsdom doesn't do.
            renderPanneau({
                config: createBootConfig({
                    definition: createDefinition({
                        auth: { mode: 'external', loginUrl: '/login', logoutUrl: '/logout' },
                    }),
                }),
            });
            expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
        });
    });
});
