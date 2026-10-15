import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { type PanneauPlugin, PanneauProvider, createHistoryRouter } from '@panneau/core';
import { type DataAdapter, isApiError } from '@panneau/data';
import { createLaravelAdapter } from '@panneau/data/laravel';
import { DataAdapterProvider, definitionQueryOptions } from '@panneau/data/query';
import type { BootConfig } from '@panneau/protocol';

import { Shell } from './Shell';
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
    session,
    onUnauthorized,
}: Required<Pick<PanneauProps, 'config' | 'adapter' | 'onUnauthorized'>> & {
    plugins: readonly PanneauPlugin[];
    session: ReturnType<typeof createSessionState>;
}) {
    const [router] = useState(createHistoryRouter);
    const definitionQuery = useQuery({
        ...definitionQueryOptions(adapter),
        initialData: config.definition,
    });
    const signedOut = useSyncExternalStore(session.subscribe, session.isSignedOut);
    const loginUrl = getLoginUrl(definitionQuery.data, config);

    useEffect(() => {
        if (signedOut) {
            onUnauthorized({ loginUrl });
        }
        // Only when the session ends: `loginUrl` and the callback are read at that time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signedOut]);

    if (signedOut) {
        return (
            <div role="alert">
                <p>Your session has ended.</p>
                {loginUrl !== null ? <a href={loginUrl}>Log in</a> : null}
            </div>
        );
    }
    if (definitionQuery.data === undefined) {
        if (definitionQuery.isError) {
            return (
                <div role="alert">
                    <p>The admin panel could not be loaded.</p>
                    <button type="button" onClick={() => void definitionQuery.refetch()}>
                        Try again
                    </button>
                </div>
            );
        }
        return <p role="status">Loading…</p>;
    }
    return (
        <PanneauProvider plugins={plugins} definition={definitionQuery.data} router={router}>
            <Shell definition={definitionQuery.data} basePath={config.basePath} />
        </PanneauProvider>
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
                    session={state.session}
                    onUnauthorized={onUnauthorized}
                />
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}
