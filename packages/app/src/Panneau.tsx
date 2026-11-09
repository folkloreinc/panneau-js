import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';

import {
    type PanneauPlugin,
    PanneauProvider,
    type PluginRegistry,
    createHistoryRouter,
    createPluginRegistry,
    resolveTheme,
} from '@panneau/core';
import {
    type DataAdapter,
    ForbiddenError,
    type LoginCredentials,
    type TwoFactorAnswer,
    UnauthorizedError,
    isApiError,
} from '@panneau/data';
import { createLaravelAdapter } from '@panneau/data/laravel';
import { DataAdapterProvider, queryKeys } from '@panneau/data/query';
import { FieldsProvider, type MapsConfig, createEmbedSource } from '@panneau/fields';
import { appMessages } from '@panneau/intl';
import {
    AUTH_ERROR_PARAM,
    type Auth,
    type BootConfig,
    CONTEXT_PROBLEM_TYPE,
    type Definition,
    EMAIL_UNVERIFIED_PROBLEM_TYPE,
    TWO_FACTOR_REQUIRED_PROBLEM_TYPE,
    contextBefore,
    formatContextHeader,
    parseContextHeader,
} from '@panneau/protocol';
import { type NamedIconLoader, PanneauRoot, usePanneauIntl, usePreference } from '@panneau/ui';

import styles from './Panneau.module.css';
import { Shell } from './Shell';
import { type LoginNotice, LoginPage } from './auth/LoginPage';
import { ResetPasswordPage } from './auth/ResetPasswordPage';
import { TwoFactorRequiredPage } from './auth/TwoFactorRequiredPage';
import { EmailVerificationLinkPage, VerifyEmailPage } from './auth/VerifyEmailPage';
import { getPasskey } from './auth/webauthn';
import {
    CurrentContextProvider,
    type CurrentContextValue,
    getContextNames,
    getContextValues,
    isBuiltFor,
    selectValue,
} from './currentContext';
import { loadPage, navigate, usePathname } from './location';
import { usePluginMessages } from './messages';
import { ErrorPage, getErrorPageKind } from './pages/ErrorPage';
import {
    type AppRoute,
    contextPath,
    matchAuthPage,
    matchContext,
    matchRoute,
    routePath,
} from './routes';
import { ShellSkeleton } from './shell/ShellSkeleton';
import { COLOR_SCHEMES } from './shell/Sidebar';
import {
    type SessionState,
    createSessionState,
    getAuth,
    getLoginUrl,
    watchUnauthorized,
} from './unauthorized';

/** What `onUnauthorized` receives. */
export interface UnauthorizedContext {
    /**
     * Where to send the user: `auth.loginUrl` of the definition in `external` auth mode, or the
     * `loginUrl` of the boot config before the definition is loaded. `null` when there is none, or
     * in `panneau` auth mode, where the login page is part of the app.
     */
    loginUrl: string | null;
}

/** Props of `<Panneau>`. */
export interface PanneauProps {
    /** The boot config, validated (`readBootConfig()`, or `validateBootConfig()` of the protocol). */
    config: BootConfig;
    /** The data adapter. Defaults to `createLaravelAdapter({ baseUrl: config.apiBaseUrl })`. */
    adapter?: DataAdapter;
    /**
     * Plugins: field types, pages, locales, themes… The messages of their `locales` in the locale
     * of the definition are loaded before the shell renders.
     */
    plugins?: readonly PanneauPlugin[];
    /** The TanStack Query client. Defaults to a new one. */
    queryClient?: QueryClient;
    /**
     * Loads the icons that the definition names (`"icon": "users"`): `lucideIconLoader` of
     * `@panneau/ui/named-icons` for every Lucide icon, each one in its own chunk, or a loader of
     * only the icons the app uses. Without it, named icons render an empty space.
     *
     * Unlike `createPanneauApp()`, `<Panneau>` has no default: a bundler emits a chunk per Lucide
     * icon for `lucideIconLoader` wherever it is imported (decision 0036).
     */
    iconLoader?: NamedIconLoader | null;
    /**
     * Called once when the API answers that the user isn't authenticated (`401`, or `419` with the
     * Laravel adapter). The app then shows that the session ended. Defaults to sending the browser
     * to `loginUrl` when there is one.
     */
    onUnauthorized?: (context: UnauthorizedContext) => void;
    /**
     * The tiles and the address search of the maps of `location` fields. Defaults to
     * OpenStreetMap's tiles, without an address search (decision 0033).
     */
    maps?: MapsConfig | null;
    /**
     * The nonce of the page's Content Security Policy, for the `<style>` elements of themes and
     * fonts (`style-src 'nonce-…'`). Defaults to that of `<meta property="csp-nonce">`, which React
     * Aria reads too.
     */
    nonce?: string;
}

function redirectToLogin({ loginUrl }: UnauthorizedContext) {
    if (loginUrl !== null) {
        window.location.assign(loginUrl);
    }
}

function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Client errors (401, 403, 404, 422…) don't change on retry.
                retry: (failureCount, error) =>
                    !(isApiError(error) && error.status < 500) && failureCount < 3,
            },
        },
    });
}

function Content({
    config,
    adapter,
    baseAdapter,
    plugins,
    registry,
    iconLoader,
    session,
    onUnauthorized,
    maps,
    nonce,
}: Required<Pick<PanneauProps, 'config' | 'adapter' | 'onUnauthorized'>> &
    Pick<PanneauProps, 'nonce'> & {
        /** The adapter, without the watch of `401` answers. */
        baseAdapter: DataAdapter;
        plugins: readonly PanneauPlugin[];
        registry: PluginRegistry;
        iconLoader: NamedIconLoader | null;
        maps: MapsConfig | null;
        session: SessionState;
    }) {
    const [router] = useState(createHistoryRouter);
    const queryClient = useQueryClient();
    const status = useSyncExternalStore(session.subscribe, session.getStatus);
    // The inlined definition is that of the user the page was loaded for: after a login or a
    // logout in the app, the definition is fetched.
    const [inlined, setInlined] = useState(config.definition);

    // The current context (decision 0045): its values are a prefix of the path, and every request
    // sends them. The names of its params don't depend on the values: those of the last definition.
    const pathname = usePathname();
    const [names, setNames] = useState(() => getContextNames(config.definition));
    const url = matchContext(pathname, config.basePath, names);
    // The pages that the links of the backend's emails open, outside the context (decision 0048)
    const authPage =
        getAuth(config.definition, config)?.mode === 'panneau'
            ? matchAuthPage(pathname, config.basePath)
            : null;
    const contextKey = formatContextHeader(url.values, names);
    // One adapter per context, kept from render to render: hooks and sources depend on it.
    const [bound, setBound] = useState(() => ({
        key: contextKey,
        adapter: withContext(adapter, url.values),
    }));
    if (bound.key !== contextKey) {
        setBound({
            key: contextKey,
            adapter: withContext(adapter, parseContextHeader(contextKey)),
        });
    }
    const scoped = bound.key === contextKey ? bound.adapter : adapter;
    const definitionQuery = useQuery({
        // `definitionQueryOptions()`, with the values of the context in the key
        queryKey: [...queryKeys.definition(), contextKey],
        queryFn: ({ signal }) => scoped.getDefinition({ signal }),
        staleTime: Infinity,
        initialData: isBuiltFor(inlined, url.values) ? inlined : undefined,
        enabled: status === 'active' && authPage === null,
    });
    const [colorScheme, setColorScheme] = usePreference('color-scheme', COLOR_SCHEMES);
    const definition = definitionQuery.data;
    const definitionNames = getContextNames(definition);
    if (definition !== undefined && definitionNames.join('&') !== names.join('&')) {
        // Before anything renders for the values of the path read with the names of no definition
        setNames(definitionNames);
    }

    // The context the shell shows: going to other values, back or forward, loads the app again,
    // so that nothing of the previous context shows, not even from the cache.
    const applied = getContextValues(definition);
    const appliedKey = formatContextHeader(applied, names);
    // The values of the path the shell was first shown for, and those of its definition, which
    // the path gets when the backend chose some
    const [shown, setShown] = useState<{ url: string; applied: string } | null>(null);
    if (shown === null && definition !== undefined && status === 'active') {
        setShown({ url: contextKey, applied: appliedKey });
    }
    const switched = shown !== null && contextKey !== shown.url && contextKey !== shown.applied;
    const contextProblem =
        definitionQuery.error instanceof ForbiddenError &&
        definitionQuery.error.problem.type === CONTEXT_PROBLEM_TYPE
            ? definitionQuery.error.problem.param
            : undefined;
    // A value the user can't use: the app without it and the values after it
    const refusedPath =
        typeof contextProblem === 'string' && url.values[contextProblem] !== undefined
            ? `${normalizeBase(config.basePath)}${contextPath(
                  selectValue(paramsOf(url.values, names), contextProblem, null),
                  names,
              )}`
            : null;
    const shownDefinition = definition !== undefined && !switched;
    useEffect(() => {
        if (switched) {
            loadPage(window.location.href, { replace: true });
        } else if (refusedPath !== null) {
            loadPage(refusedPath, { replace: true });
        }
    }, [switched, refusedPath]);
    // The backend chose values the path hasn't: the path gets them, in place.
    const putChosenValues = useEffectEvent(() => {
        queryClient.setQueryData([...queryKeys.definition(), appliedKey], definition);
        const rest = window.location.pathname.slice(url.basePath.length);
        navigate(
            `${normalizeBase(config.basePath)}${contextPath(applied, names)}${rest}${window.location.search}${window.location.hash}`,
            { replace: true },
        );
    });
    useEffect(() => {
        if (shownDefinition && status === 'active' && appliedKey !== contextKey) {
            putChosenValues();
        }
    }, [shownDefinition, appliedKey, contextKey, status]);

    const currentContext: CurrentContextValue | null =
        definition?.context !== undefined
            ? {
                  params: definition.context.params,
                  getOptions: (name, q, signal) => {
                      const before = contextBefore(applied, names, name);
                      const source = withContext(adapter, before);
                      return source.getContextOptions !== undefined
                          ? source.getContextOptions(name, { q, ...(signal ? { signal } : {}) })
                          : Promise.resolve([]);
                  },
                  select: (name, value) => {
                      const values = selectValue(definition.context?.params ?? [], name, value);
                      const base = `${normalizeBase(config.basePath)}${contextPath(values, names)}`;
                      loadPage(
                          contextTarget(matchRoute(window.location.pathname, url.basePath), base),
                      );
                  },
              }
            : null;
    // The auth settings outlive the definition of a user who logged out.
    const [lastAuth, setLastAuth] = useState<Auth | null>(null);
    const auth = getAuth(definition, config) ?? lastAuth;
    const locale = definition?.locale ?? config.locale;
    const messages = usePluginMessages(registry, locale);
    const loginUrl = getLoginUrl(definition, config);

    // Only when the session ends: `loginUrl` and the callback are read at that time.
    const sessionEnded = useEffectEvent(() => onUnauthorized({ loginUrl }));
    useEffect(() => {
        if (status === 'ended') {
            sessionEnded();
        }
    }, [status]);

    // Nothing of the previous user stays in the cache.
    const forgetUser = () => {
        setLastAuth(auth);
        setInlined(undefined);
        queryClient.removeQueries({ queryKey: queryKeys.all });
    };
    const loggedIn = () => {
        forgetUser();
        setNotice(null);
        session.logIn();
    };
    const logIn = async (credentials: LoginCredentials) => {
        const result = await adapter.login(credentials);
        // The login waits for its second factor (decision 0049)
        if ('twoFactor' in result && result.twoFactor === true) {
            return 'two-factor' as const;
        }
        loggedIn();
        return undefined;
    };
    // What the login page says after an auth page, and the email it starts with
    const [notice, setNotice] = useState<{ notice: LoginNotice; email?: string } | null>(null);
    const home = routePath({ name: 'home' }, config.basePath);
    // From an auth page to the app, or to its login page: the definition is fetched again.
    const leaveAuthPage = (next: { notice: LoginNotice; email?: string }) => {
        forgetUser();
        setNotice(next);
        navigate(home, { replace: true });
    };
    const refusedType =
        definitionQuery.error instanceof ForbiddenError ? definitionQuery.error.problem.type : null;
    const emailUnverified =
        definitionQuery.error instanceof ForbiddenError &&
        definitionQuery.error.problem.type === EMAIL_UNVERIFIED_PROBLEM_TYPE;
    const search = new URLSearchParams(window.location.search);
    // A login with a provider that failed comes back with its code (decision 0052): the login page
    // says it once, and the address loses it, so that a reload doesn't
    const [providerError] = useState(() => search.get(AUTH_ERROR_PARAM) ?? undefined);
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has(AUTH_ERROR_PARAM)) {
            url.searchParams.delete(AUTH_ERROR_PARAM);
            navigate(`${url.pathname}${url.search}${url.hash}`, { replace: true });
        }
    }, []);
    // `panneau` mode: the API logs out, and the login page shows. `external` mode: the site's own
    // logout, when the definition has one.
    const logoutUrl = auth?.mode === 'external' ? (auth.logoutUrl ?? null) : null;
    const logOut =
        auth?.mode === 'panneau'
            ? async () => {
                  // A session that already ended is logged out.
                  await baseAdapter.logout().catch((error: unknown) => {
                      if (!(error instanceof UnauthorizedError)) {
                          throw error;
                      }
                  });
                  session.logOut();
                  forgetUser();
              }
            : logoutUrl !== null
              ? () => window.location.assign(logoutUrl)
              : undefined;

    const scheme = colorScheme ?? definition?.theme?.colorScheme ?? 'light';
    return (
        <PanneauRoot
            theme={
                definition !== undefined
                    ? resolveTheme(definition.theme, createPluginRegistry(plugins).themes)
                    : null
            }
            colorScheme={scheme}
            density={definition?.theme?.density ?? 'auto'}
            locale={locale}
            messages={messages}
            iconLoader={iconLoader}
            {...(nonce !== undefined ? { nonce } : {})}
            className={styles.root}
        >
            {authPage === 'resetPassword' && adapter.resetPassword !== undefined ? (
                <ResetPasswordPage
                    token={search.get('token')}
                    email={search.get('email')}
                    onReset={(reset) => adapter.resetPassword?.(reset) ?? Promise.resolve()}
                    onDone={(email) => leaveAuthPage({ notice: 'password-reset', email })}
                    onBack={() => navigate(home, { replace: true })}
                />
            ) : authPage === 'verifyEmail' && adapter.verifyEmail !== undefined ? (
                <EmailVerificationLinkPage
                    token={search.get('token')}
                    onVerify={(token) => adapter.verifyEmail?.(token) ?? Promise.resolve()}
                    onContinue={() => leaveAuthPage({ notice: 'email-verified' })}
                />
            ) : status !== 'active' && auth?.mode === 'panneau' ? (
                <LoginPage
                    auth={auth}
                    name={definition?.name}
                    // A guest who just arrived had no session
                    sessionEnded={status === 'ended' && definition !== undefined}
                    {...(notice?.notice !== undefined ? { notice: notice.notice } : {})}
                    {...(notice?.email !== undefined ? { email: notice.email } : {})}
                    {...(providerError !== undefined ? { providerError } : {})}
                    next={`${window.location.pathname}${window.location.search}`}
                    onLogIn={logIn}
                    {...(adapter.passkeyLoginOptions !== undefined &&
                    adapter.passkeyLogin !== undefined
                        ? {
                              onPasskeyLogIn: async () => {
                                  const request = await adapter.passkeyLoginOptions?.();
                                  if (request === undefined) {
                                      return;
                                  }
                                  const credential = await getPasskey(request.options);
                                  await adapter.passkeyLogin?.({ credential });
                                  loggedIn();
                              },
                          }
                        : {})}
                    {...(adapter.twoFactorChallenge !== undefined
                        ? {
                              onTwoFactorChallenge: async (answer: TwoFactorAnswer) => {
                                  await adapter.twoFactorChallenge?.(answer);
                                  loggedIn();
                              },
                          }
                        : {})}
                    {...(adapter.forgotPassword !== undefined
                        ? {
                              onForgotPassword: (email: string) =>
                                  adapter.forgotPassword?.(email) ?? Promise.resolve(),
                          }
                        : {})}
                />
            ) : refusedType === TWO_FACTOR_REQUIRED_PROBLEM_TYPE &&
              adapter.enableTwoFactor !== undefined &&
              adapter.confirmTwoFactor !== undefined ? (
                <TwoFactorRequiredPage
                    onEnable={() =>
                        adapter.enableTwoFactor?.() ?? Promise.reject(new Error('No setup.'))
                    }
                    onConfirm={(code) =>
                        adapter.confirmTwoFactor?.(code) ?? Promise.reject(new Error('No setup.'))
                    }
                    onConfirmPassword={
                        adapter.confirmPassword !== undefined
                            ? (password) => adapter.confirmPassword?.(password) ?? Promise.resolve()
                            : undefined
                    }
                    onDone={() => void definitionQuery.refetch()}
                    {...(logOut !== undefined
                        ? { onLogOut: () => void Promise.resolve(logOut()).catch(() => undefined) }
                        : {})}
                />
            ) : emailUnverified ? (
                <VerifyEmailPage
                    {...(adapter.sendEmailVerification !== undefined
                        ? {
                              onSend: () => adapter.sendEmailVerification?.() ?? Promise.resolve(),
                          }
                        : {})}
                    onContinue={() => void definitionQuery.refetch()}
                    {...(logOut !== undefined
                        ? { onLogOut: () => void Promise.resolve(logOut()).catch(() => undefined) }
                        : {})}
                />
            ) : status !== 'active' ? (
                <SessionEnded loginUrl={loginUrl} />
            ) : switched || refusedPath !== null ? (
                <ShellSkeleton />
            ) : definition === undefined ? (
                <Loading
                    error={definitionQuery.error}
                    onRetry={() => void definitionQuery.refetch()}
                />
            ) : messages === undefined ? (
                <ShellSkeleton />
            ) : (
                <PanneauProvider plugins={plugins} definition={definition} router={router}>
                    <DataAdapterProvider adapter={scoped}>
                        <CurrentContextProvider value={currentContext}>
                            {/* What `embed` and `location` fields need, in every form */}
                            <FieldsProvider embedSource={createEmbedSource(scoped)} maps={maps}>
                                <Shell
                                    definition={definition}
                                    basePath={url.basePath}
                                    colorScheme={scheme}
                                    onColorSchemeChange={setColorScheme}
                                    onLogOut={logOut}
                                />
                            </FieldsProvider>
                        </CurrentContextProvider>
                    </DataAdapterProvider>
                </PanneauProvider>
            )}
        </PanneauRoot>
    );
}

function normalizeBase(basePath: string): string {
    return basePath.replace(/\/+$/, '');
}

const warned = new WeakSet<DataAdapter>();

/** The adapter that sends these values of the context, or the adapter itself without values. */
function withContext(adapter: DataAdapter, values: Readonly<Record<string, string>>): DataAdapter {
    if (Object.keys(values).length === 0) {
        return adapter;
    }
    if (adapter.withContext === undefined) {
        if (!warned.has(adapter)) {
            warned.add(adapter);
            console.warn(
                '[panneau] The definition has a context, but the data adapter has no withContext(): requests are sent without it.',
            );
        }
        return adapter;
    }
    return adapter.withContext(values);
}

/** Params with only their values, to drop a value and those after it. */
function paramsOf(
    values: Readonly<Record<string, string>>,
    names: readonly string[],
): NonNullable<Definition['context']>['params'] {
    return names.map((name) => ({ name, label: name, value: values[name] ?? null }));
}

/**
 * Where to go for other values of the context: the list of the resource of the current route,
 * or the home page. An item, or a page about one thing, may not be in the other context.
 */
function contextTarget(route: AppRoute | null, base: string): string {
    if (route !== null && 'resource' in route) {
        return routePath({ name: 'resource.index', resource: route.resource }, base);
    }
    if (route?.name === 'page' && (route.segments ?? []).length === 0) {
        return routePath(route, base);
    }
    return routePath({ name: 'home' }, base);
}

function SessionEnded({ loginUrl }: { loginUrl: string | null }) {
    const intl = usePanneauIntl();
    return (
        <div role="alert" className={styles.state}>
            <p>{intl.formatMessage(appMessages.sessionEnded)}</p>
            {loginUrl !== null ? (
                <a href={loginUrl}>{intl.formatMessage(appMessages.logIn)}</a>
            ) : null}
        </div>
    );
}

/**
 * The boot, until the definition is loaded: the skeleton of the shell, or, when it failed, the
 * error page on a panel, in the frame of the shell: the user isn't allowed in (`403`), the server
 * failed, or it can't be reached.
 */
function Loading({ error, onRetry }: { error: unknown; onRetry: () => void }) {
    if (error !== null) {
        return (
            <div className={styles.frame}>
                <div className={styles.panel}>
                    <ErrorPage kind={getErrorPageKind(error)} onRetry={onRetry} />
                </div>
            </div>
        );
    }
    return <ShellSkeleton />;
}

/**
 * The Panneau admin panel, for a React app that renders it itself. `createPanneauApp()` mounts it
 * in an element of the page. The adapter, the query client and the locales of the plugins are
 * read on the first render.
 *
 * It uses the definition inlined in the boot config, or fetches it, then renders the shell. When
 * the API answers that the user isn't authenticated, it calls `onUnauthorized`.
 */
export function Panneau({
    config,
    adapter,
    plugins = [],
    queryClient,
    iconLoader = null,
    onUnauthorized = redirectToLogin,
    maps = null,
    nonce,
}: PanneauProps) {
    const [state] = useState(() => {
        const session = createSessionState();
        const baseAdapter = adapter ?? createLaravelAdapter({ baseUrl: config.apiBaseUrl });
        return {
            session,
            baseAdapter,
            adapter: watchUnauthorized(baseAdapter, session),
            queryClient: queryClient ?? createQueryClient(),
            registry: createPluginRegistry(plugins),
        };
    });
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <Content
                    config={config}
                    adapter={state.adapter}
                    baseAdapter={state.baseAdapter}
                    plugins={plugins}
                    registry={state.registry}
                    iconLoader={iconLoader}
                    session={state.session}
                    onUnauthorized={onUnauthorized}
                    maps={maps}
                    {...(nonce !== undefined ? { nonce } : {})}
                />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}
