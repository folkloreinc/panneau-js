import { QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useIntl } from 'react-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PanneauPlugin, definePlugin } from '@panneau/core';
import { type DataAdapter, UnauthorizedError, ValidationError } from '@panneau/data';
import { queryKeys } from '@panneau/data/query';
import { type BootConfigInput, type DefinitionInput, validateBootConfig } from '@panneau/protocol';

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
        expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
        await user.click(screen.getByRole('button', { name: 'Try again' }));
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
