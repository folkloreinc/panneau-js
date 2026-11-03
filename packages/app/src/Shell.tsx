import { useQueryClient } from '@tanstack/react-query';
import { createElement, useEffect, useState } from 'react';
import { RouterProvider } from 'react-aria-components';

import { ActionRunnerProvider } from '@panneau/actions';
import {
    LeaveGuardsProvider,
    canViewPage,
    createLeaveGuards,
    findResource,
    resolveResource,
    usePlugins,
} from '@panneau/core';
import { invalidateActionResult, useDataAdapter } from '@panneau/data/query';
import { appMessages } from '@panneau/intl';
import type { Definition } from '@panneau/protocol';
import { Alert, usePanneauIntl, useToast } from '@panneau/ui';

import { DocumentTitle } from './documentTitle';
import { navigate, setHistoryGuard, usePathname } from './location';
import { ErrorPage } from './pages/ErrorPage';
import { HomePage } from './pages/HomePage';
import { PageErrorBoundary } from './pages/PageErrorBoundary';
import { ResourceFormPage } from './pages/ResourceFormPage';
import { ResourceListPage } from './pages/ResourceListPage';
import { resolveRoute } from './routeReference';
import { type AppRoute, matchRoute, routePath } from './routes';
import { AppLayout } from './shell/AppLayout';
import type { ColorSchemePreference } from './shell/Sidebar';

export interface ShellProps {
    definition: Definition;
    basePath: string;
    colorScheme: ColorSchemePreference;
    onColorSchemeChange: (scheme: ColorSchemePreference) => void;
    /** Logs the user out. Without it, the shell offers no logout. */
    onLogOut?: () => Promise<void> | void;
}

interface PageProps {
    definition: Definition;
    basePath: string;
}

/**
 * A page of the definition's `pages`: a plugin's component, with the page's props, the definition,
 * and the values of its `params` from the path. The built-in `dashboard`, which plugins can replace, is the cards of the resources
 * until the dashboard of 5.x has widgets.
 */
function DefinitionPage({
    page,
    definition,
    basePath,
    params = {},
}: PageProps & {
    page: NonNullable<Definition['pages']>[string];
    /** The values of the page's `params`, from its path. */
    params?: Record<string, string>;
}) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const Component = plugins.pages.get(page.component);
    // Before the page: a page that sets its own title sets it last
    return (
        <>
            <DocumentTitle parts={[page.label]} />
            {Component !== undefined ? (
                createElement(Component, { ...page.props, definition, params })
            ) : page.component === 'dashboard' ? (
                <HomePage definition={definition} basePath={basePath} />
            ) : (
                <Alert tone="warning">
                    {intl.formatMessage(appMessages.missingPage, {
                        component: page.component,
                    })}
                </Alert>
            )}
        </>
    );
}

function Page({ definition, basePath, route }: PageProps & { route: AppRoute }) {
    const homeHref = routePath({ name: 'home' }, basePath);
    const notFound = <ErrorPage kind="not-found" homeHref={homeHref} />;
    // A route the user can't open: a resource in the definition, a page, the create route
    // (decision 0046)
    const forbidden = <ErrorPage kind="forbidden" homeHref={homeHref} />;
    switch (route.name) {
        case 'home': {
            // `pages.home` of the definition, or the cards of the resources (decision 0019), also
            // when the user can't open `pages.home` (decision 0046)
            const page = definition.pages?.home;
            return page !== undefined && canViewPage(page) ? (
                <DefinitionPage page={page} definition={definition} basePath={basePath} />
            ) : (
                <HomePage definition={definition} basePath={basePath} />
            );
        }
        case 'not-found':
            return notFound;
        case 'page': {
            const page = definition.pages?.[route.page];
            const names = page?.params ?? [];
            const segments = route.segments ?? [];
            // A page takes exactly the segments of its `params`.
            if (page === undefined || segments.length !== names.length) {
                return notFound;
            }
            if (!canViewPage(page)) {
                return forbidden;
            }
            return (
                <DefinitionPage
                    key={segments.join('/')}
                    page={page}
                    definition={definition}
                    basePath={basePath}
                    params={Object.fromEntries(
                        names.map((name, index) => [name, segments[index] ?? '']),
                    )}
                />
            );
        }
        default: {
            const resource = findResource(definition, route.resource);
            if (resource === undefined) {
                return notFound;
            }
            const resolved = resolveResource(resource);
            if (route.name === 'resource.index' || route.name === 'resource.show') {
                // The show route is the list with the item's details in a panel: the same page,
                // so the list keeps its state while the panel opens, closes or changes item.
                return resolved.abilities.viewAny ? (
                    <ResourceListPage
                        key={resource.id}
                        resolved={resolved}
                        basePath={basePath}
                        locale={definition.locale}
                        selectedId={route.name === 'resource.show' ? route.id : null}
                        resolveRoute={(reference) => resolveRoute(definition, basePath, reference)}
                    />
                ) : (
                    forbidden
                );
            }
            if (route.name === 'resource.create' && !resolved.abilities.create) {
                return forbidden;
            }
            return (
                <ResourceFormPage
                    key={`${resource.id}/${route.name === 'resource.create' ? '' : route.id}`}
                    definition={definition}
                    resolved={resolved}
                    basePath={basePath}
                    id={route.name === 'resource.create' ? null : route.id}
                    resolveRoute={(reference) => resolveRoute(definition, basePath, reference)}
                />
            );
        }
    }
}

/**
 * The app shell: the layout with its sidebar, and the page of the current route. Links go
 * through the history of the browser without reloading the page, and actions run through the
 * adapter, refreshing what their result changed. Leaving a page with unsaved changes, by a link
 * or by going back or forward, asks first.
 */
export function Shell({
    definition,
    basePath,
    colorScheme,
    onColorSchemeChange,
    onLogOut,
}: ShellProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const adapter = useDataAdapter();
    const route = matchRoute(pathname, basePath) ?? { name: 'not-found' };
    // Forms with unsaved changes guard leaving their page
    const [guards] = useState(createLeaveGuards);
    useEffect(() => setHistoryGuard(guards), [guards]);
    // Paths outside the app (a link to the site) load their page: the browser guards them.
    const go = (href: string) => {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin && matchRoute(url.pathname, basePath) !== null) {
            void guards.confirmLeave().then((leave) => {
                if (leave) {
                    navigate(`${url.pathname}${url.search}${url.hash}`);
                }
            });
        } else {
            window.location.assign(url);
        }
    };
    // Like leaving the page: unsaved changes ask first.
    const logOut =
        onLogOut !== undefined
            ? () => {
                  void guards.confirmLeave().then(async (leave) => {
                      if (!leave) {
                          return;
                      }
                      try {
                          await onLogOut();
                      } catch {
                          toasts.show({
                              title: intl.formatMessage(appMessages.logOutError),
                              tone: 'danger',
                          });
                      }
                  });
              }
            : undefined;
    return (
        <LeaveGuardsProvider guards={guards}>
            <RouterProvider navigate={go}>
                <ActionRunnerProvider
                    adapter={adapter}
                    locales={definition.locales}
                    onResult={(result, { resource, target }) =>
                        invalidateActionResult(queryClient, resource, result, target.selection)
                    }
                    onNavigate={(to) => {
                        const path =
                            typeof to === 'string' ? to : resolveRoute(definition, basePath, to);
                        if (path !== null) {
                            go(path);
                        }
                    }}
                >
                    <AppLayout
                        definition={definition}
                        basePath={basePath}
                        route={route}
                        colorScheme={colorScheme}
                        onColorSchemeChange={onColorSchemeChange}
                        onLogOut={logOut}
                    >
                        <PageErrorBoundary
                            homeHref={routePath({ name: 'home' }, basePath)}
                            path={pathname}
                        >
                            <Page definition={definition} basePath={basePath} route={route} />
                        </PageErrorBoundary>
                    </AppLayout>
                </ActionRunnerProvider>
            </RouterProvider>
        </LeaveGuardsProvider>
    );
}
