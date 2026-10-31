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
    type LoginCredentials,
    UnauthorizedError,
    isApiError,
} from '@panneau/data';
import { createLaravelAdapter } from '@panneau/data/laravel';
import { DataAdapterProvider, definitionQueryOptions, queryKeys } from '@panneau/data/query';
import { FieldsProvider, type MapsConfig, createEmbedSource } from '@panneau/fields';
import { appMessages } from '@panneau/intl';
import type { Auth, BootConfig } from '@panneau/protocol';
import { Button, type NamedIconLoader, PanneauRoot, usePanneauIntl } from '@panneau/ui';

import styles from './Panneau.module.css';
import { Shell } from './Shell';
import { LoginPage } from './auth/LoginPage';
import { usePluginMessages } from './messages';
import { usePreference } from './preferences';
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
    const definitionQuery = useQuery({
        ...definitionQueryOptions(adapter),
        initialData: inlined,
        enabled: status === 'active',
    });
    const [colorScheme, setColorScheme] = usePreference('color-scheme', COLOR_SCHEMES);
    const definition = definitionQuery.data;
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
    const logIn = async (credentials: LoginCredentials) => {
        await adapter.login(credentials);
        forgetUser();
        session.logIn();
    };
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
            locale={locale}
            messages={messages}
            iconLoader={iconLoader}
            {...(nonce !== undefined ? { nonce } : {})}
            className={styles.root}
        >
            {status !== 'active' && auth?.mode === 'panneau' ? (
                <LoginPage
                    auth={auth}
                    name={definition?.name}
                    // A guest who just arrived had no session
                    sessionEnded={status === 'ended' && definition !== undefined}
                    onLogIn={logIn}
                />
            ) : status !== 'active' ? (
                <SessionEnded loginUrl={loginUrl} />
            ) : definition === undefined ? (
                <Loading
                    isError={definitionQuery.isError}
                    onRetry={() => void definitionQuery.refetch()}
                />
            ) : messages === undefined ? (
                <ShellSkeleton />
            ) : (
                <PanneauProvider plugins={plugins} definition={definition} router={router}>
                    {/* What `embed` and `location` fields need, in every form */}
                    <FieldsProvider embedSource={createEmbedSource(adapter)} maps={maps}>
                        <Shell
                            definition={definition}
                            basePath={config.basePath}
                            colorScheme={scheme}
                            onColorSchemeChange={setColorScheme}
                            onLogOut={logOut}
                        />
                    </FieldsProvider>
                </PanneauProvider>
            )}
        </PanneauRoot>
    );
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

function Loading({ isError, onRetry }: { isError: boolean; onRetry: () => void }) {
    const intl = usePanneauIntl();
    if (isError) {
        return (
            <div role="alert" className={styles.state}>
                <p>{intl.formatMessage(appMessages.loadError)}</p>
                <Button onPress={onRetry}>{intl.formatMessage(appMessages.retry)}</Button>
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
