/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash/isObject';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import { useUser } from '@panneau/auth';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import {
    usePagesComponentsManager,
    usePanneau,
    usePanneauResources,
    useRoutes,
    useUrlGenerator,
} from '@panneau/core/contexts';

import createResourceRoutes from './createResourceRoutes';
import AccountPage from './pages/Account';
import ErrorPage from './pages/Error';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';

const propTypes = {
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    statusCode: null,
};

const PanneauRoutes = ({ statusCode: initialStatusCode }) => {
    const routes = useRoutes();
    const { pathname } = useLocation();
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
        index: indexPage = null,
        show: showPage = null,
        create: createPage = null,
        edit: editPage = null,
        delete: deletePage = null,
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
        return <ErrorComponent statusCode={statusCode} />;
    }

    // If user is unauthenticated
    if (user === null) {
        return (
            <Routes>
                <Route path={routes['auth.login']} exact element={<LoginComponent />} />
                <Route
                    path="*"
                    element={
                        <Navigate
                            to={`${route('auth.login')}?next=${encodeURIComponent(pathname)}`}
                            replace
                        />
                    }
                />
            </Routes>
        );
    }

    // Normal routes
    return (
        <Routes>
            <Route path={routes.home} exact element={<HomeComponent />} />
            {resources.map((resource) => {
                const { id: resourceId } = resource || {};
                return (
                    <Fragment key={`resource-${resourceId}`}>
                        {createResourceRoutes(resource, { route, componentsManager, pages })}
                    </Fragment>
                );
            })}
            <Route path={routes.account} exact element={<AccountComponent />} />
            {customRoutes.map(
                ({ path = null, route: pageRoute = null, component, exact = true, ...props }) => {
                    const PageComponent = componentsManager.getComponent(component);
                    return PageComponent !== null ? (
                        <Route
                            path={path || routes[pageRoute]}
                            exact={exact}
                            element={<PageComponent {...props} />}
                        />
                    ) : null;
                },
            )}
            <Route path="*" element={<ErrorComponent />} />
        </Routes>
    );
};
PanneauRoutes.propTypes = propTypes;
PanneauRoutes.defaultProps = defaultProps;

export default PanneauRoutes;
