import isObject from 'lodash/isObject';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'wouter';

import { useUser } from '@panneau/auth';
import {
    usePagesComponentsManager,
    usePanneau,
    usePanneauResources,
    useRoutes,
    useUrlGenerator,
} from '@panneau/core/contexts';
import type { StatusCode } from '@panneau/core/types';

import createResourceRoutes from './createResourceRoutes';
import AccountPage from './pages/Account';
import ErrorPage from './pages/Error';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';

interface PanneauRoutesProps {
    statusCode?: StatusCode | null;
}

function PanneauRoutes({ statusCode: initialStatusCode = null }: PanneauRoutesProps) {
    const routes = useRoutes();
    const [pathname] = useLocation();
    const [{ statusCode, pathname: lastPathname }, setInitialRequest] = useState({
        statusCode: initialStatusCode,
        pathname,
    });
    const user = useUser();
    const route = useUrlGenerator();
    const resources = usePanneauResources();
    const componentsManager = usePagesComponentsManager();

    useEffect(() => {
        if (pathname !== lastPathname) {
            setInitialRequest({
                pathname,
                statusCode: null,
            });
        }
    }, [pathname, lastPathname]);

    // Custom Pages
    const { pages = null, routes: routesDefinition } = usePanneau();
    const {
        home: homePage = null,
        login: loginPage = null,
        account: accountPage = null,
        error: errorPage = null,
        index: initialIndexPage = null,
        show: initialShowPage = null,
        create: initialCreatePage = null,
        edit: initialEditPage = null,
        delete: initialDeletePage = null,
        duplicate: initialDuplicatePage = null,
        ...otherPages
    } = pages || {};

    const customRoutes = useMemo(
        () => [
            ...Object.keys(routesDefinition)
                .filter(
                    (key) =>
                        key.match(/^(resources\.|auth\.)/) === null &&
                        key !== 'home' &&
                        key !== 'account',
                )
                .filter((key) => {
                    const routeDef = routesDefinition[key];
                    return (
                        isObject(routeDef) &&
                        typeof routeDef.component !== 'undefined' &&
                        typeof routeDef.path !== 'undefined'
                    );
                })
                .map((key) => routesDefinition[key]),
            ...Object.keys(otherPages)
                .map((key) => otherPages[key])
                .filter(
                    ({ path = null, route: pageRoute = null }) =>
                        path !== null || pageRoute !== null,
                ),
        ],
        [routesDefinition, otherPages],
    );

    const HomeComponent = componentsManager.getComponent(homePage?.component) || HomePage;
    const LoginComponent = componentsManager.getComponent(loginPage?.component) || LoginPage;
    const AccountComponent = componentsManager.getComponent(accountPage?.component) || AccountPage;
    const ErrorComponent = componentsManager.getComponent(errorPage?.component) || ErrorPage;

    // If there is an error status code
    if (statusCode !== null) {
        return <ErrorComponent statusCode={statusCode} {...errorPage} />;
    }

    // If user is unauthenticated
    if (user === null) {
        return (
            <Switch>
                <Route path={routes['auth.login']}>
                    <LoginComponent {...loginPage} />
                </Route>
                <Route>
                    <Redirect to={`${route('auth.login')}?next=${encodeURIComponent(pathname)}`} />
                </Route>
            </Switch>
        );
    }

    // Normal routes
    return (
        <Switch>
            {user !== null ? (
                <Route path={routes['auth.login']}>
                    <Redirect to={routes.home} replace />
                </Route>
            ) : null}
            {resources.map((resource) => {
                const { id: resourceId } = resource || {};
                return (
                    <Fragment key={`resource-${resourceId}`}>
                        {createResourceRoutes(resource, { route, componentsManager, pages })}
                    </Fragment>
                );
            })}
            <Route path={routes.account}>
                <AccountComponent {...accountPage} />
            </Route>
            {customRoutes.map(({ path = null, route: pageRoute = null, component, ...props }) => {
                const PageComponent = componentsManager.getComponent(component);
                const finalPath = path || routes[pageRoute];
                return PageComponent !== null ? (
                    <Route key={`custom-route-${finalPath}`} path={path || routes[pageRoute]}>
                        <PageComponent {...props} />
                    </Route>
                ) : null;
            })}
            <Route path={routes.home}>
                <HomeComponent {...homePage} />
            </Route>
            <Route>
                <ErrorComponent />
            </Route>
        </Switch>
    );
}

export default PanneauRoutes;
