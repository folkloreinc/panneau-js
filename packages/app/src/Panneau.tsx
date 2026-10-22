import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';

import {
    type PanneauPlugin,
    PanneauProvider,
    createHistoryRouter,
    createPluginRegistry,
    resolveTheme,
} from '@panneau/core';
import { type DataAdapter, isApiError } from '@panneau/data';
import { createLaravelAdapter } from '@panneau/data/laravel';
import { DataAdapterProvider, definitionQueryOptions } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { BootConfig } from '@panneau/protocol';
import { Button, type NamedIconLoader, PanneauRoot, Spinner, usePanneauIntl } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

import styles from './Panneau.module.css';
import { Shell } from './Shell';
import { usePreference } from './preferences';
import { COLOR_SCHEMES } from './shell/Sidebar';
import { createSessionState, getLoginUrl, watchUnauthorized } from './unauthorized';

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
    /** Plugins: field types, pages, locales, themes… */
    plugins?: readonly PanneauPlugin[];
    /** The TanStack Query client. Defaults to a new one. */
    queryClient?: QueryClient;
    /**
     * Loads the Lucide icons that the definition names (`"icon": "users"`). Defaults to every
     * Lucide icon, each one in its own chunk, loaded when shown. `null` shows no named icons.
     */
    iconLoader?: NamedIconLoader | null;
    /**
     * Called once when the API answers that the user isn't authenticated (`401`, or `419` with the
     * Laravel adapter). The app then shows that the session ended. Defaults to sending the browser
     * to `loginUrl` when there is one.
     */
    onUnauthorized?: (context: UnauthorizedContext) => void;
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
    plugins,
    iconLoader,
    session,
    onUnauthorized,
}: Required<Pick<PanneauProps, 'config' | 'adapter' | 'onUnauthorized'>> & {
    plugins: readonly PanneauPlugin[];
    iconLoader: NamedIconLoader | null;
    session: ReturnType<typeof createSessionState>;
}) {
    const [router] = useState(createHistoryRouter);
    const definitionQuery = useQuery({
        ...definitionQueryOptions(adapter),
        initialData: config.definition,
    });
    const signedOut = useSyncExternalStore(session.subscribe, session.isSignedOut);
    const [colorScheme, setColorScheme] = usePreference('color-scheme', COLOR_SCHEMES);
    const definition = definitionQuery.data;
    const loginUrl = getLoginUrl(definition, config);

    useEffect(() => {
        if (signedOut) {
            onUnauthorized({ loginUrl });
        }
        // Only when the session ends: `loginUrl` and the callback are read at that time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signedOut]);

    const scheme = colorScheme ?? definition?.theme?.colorScheme ?? 'light';
    return (
        <PanneauRoot
            theme={
                definition !== undefined
                    ? resolveTheme(definition.theme, createPluginRegistry(plugins).themes)
                    : null
            }
            colorScheme={scheme}
            locale={definition?.locale ?? config.locale}
            iconLoader={iconLoader}
            className={styles.root}
        >
            {signedOut ? (
                <SessionEnded loginUrl={loginUrl} />
            ) : definition === undefined ? (
                <Loading
                    isError={definitionQuery.isError}
                    onRetry={() => void definitionQuery.refetch()}
                />
            ) : (
                <PanneauProvider plugins={plugins} definition={definition} router={router}>
                    <Shell
                        definition={definition}
                        basePath={config.basePath}
                        colorScheme={scheme}
                        onColorSchemeChange={setColorScheme}
                    />
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
    return (
        <div className={styles.state}>
            <Spinner showLabel label={intl.formatMessage(appMessages.loading)} />
        </div>
    );
}

/**
 * The Panneau admin panel, for a React app that renders it itself. `createPanneauApp()` mounts it
 * in an element of the page. The adapter and the query client are read on the first render.
 *
 * It uses the definition inlined in the boot config, or fetches it, then renders the shell. When
 * the API answers that the user isn't authenticated, it calls `onUnauthorized`.
 */
export function Panneau({
    config,
    adapter,
    plugins = [],
    queryClient,
    iconLoader = lucideIconLoader,
    onUnauthorized = redirectToLogin,
}: PanneauProps) {
    const [state] = useState(() => {
        const session = createSessionState();
        return {
            session,
            adapter: watchUnauthorized(
                adapter ?? createLaravelAdapter({ baseUrl: config.apiBaseUrl }),
                session,
            ),
            queryClient: queryClient ?? createQueryClient(),
        };
    });
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <Content
                    config={config}
                    adapter={state.adapter}
                    plugins={plugins}
                    iconLoader={iconLoader}
                    session={state.session}
                    onUnauthorized={onUnauthorized}
                />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}
