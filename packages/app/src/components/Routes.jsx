import React, { useEffect, useState } from 'react';
import { Redirect, Route, Routes, useLocation } from 'react-router';

import { useUser } from '@panneau/auth';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import { parse as parseQuery } from 'query-string';
import {
    usePanneau,
    usePanneauResources,
    useRoutes,
    useUrlGenerator,
    useComponentsManager,
} from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';

import createResourceRoutes from './createResourceRoutes';
import * as basePages from './pages';

const propTypes = {
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    statusCode: null,
};

const PanneauRoutes = ({ statusCode: initialStatusCode }) => {
    const { pages = {} } = usePanneau();
    const routes = useRoutes();
    const { pathname } = useLocation(); // search

    const [{ statusCode, pathname: initialPathname }, setInitialRequest] = useState({
        statusCode: initialStatusCode,
        pathname,
    });
    const user = useUser();
    const route = useUrlGenerator();
    const resources = usePanneauResources();
    const componentsManager = useComponentsManager();

    // const nextUrl = useMemo(() => {
    //     const query = parseQuery(search);
    //     return query !== null ? query.next || null : null;
    // }, [search]);

    useEffect(() => {
        if (pathname !== initialPathname) {
            setInitialRequest({
                pathname,
                statusCode: null,
            });
        }
    }, [pathname, initialPathname]);

    // Custom Pages
    const {
        home: homePage = null,
        login: loginPage = null,
        account: accountPage = null,
        error: errorPage = null,
    } = pages || {};

    const HomeComponent = getComponentFromName(
        homePage?.component || 'home',
        basePages,
        homePage?.component,
    );

    const LoginComponent = getComponentFromName(
        loginPage?.component || 'login',
        basePages,
        loginPage?.component,
    );

    const AccountComponent = getComponentFromName(
        accountPage?.component || 'account',
        basePages,
        accountPage?.component,
    );

    const ErrorComponent = getComponentFromName(
        errorPage?.component || 'error',
        basePages,
        errorPage?.component,
    );

    return (
        <Routes>
            {statusCode !== null ? (
                <Route path="*" element={<ErrorComponent statusCode={statusCode} />} />
            ) : null}

            {/* TODO fix this shit it doesnt work */}
            {/* <Route
                path={routes.login}
                exact
                element={
                    user !== null ? (
                        <Navigate to={nextUrl !== null ? nextUrl : homeUrl} />
                    ) : (
                        <AuthLogin />
                    )
                }
            /> */}

            <Route
                path={routes.home}
                exact
                element={
                    user !== null ? <HomeComponent /> : <Navigate to={route('login')} replace />
                }
            />

            {user === null ? (
                <Route path={routes.login} exact element={<LoginComponent />} />
            ) : null}

            {resources.map((resource) => {
                const { id: resourceId } = resource || {};
                return user !== null ? (
                    createResourceRoutes(resource, { route, componentsManager })
                ) : (
                    <Route
                        key={`resource-${resourceId}`}
                        path={route('resources.index', {
                            resource: resourceId,
                        })}
                        element={
                            <Navigate
                                to={`${route('login')}?next=${encodeURIComponent(pathname)}`}
                                replace
                            />
                        }
                    />
                );
            })}
            <Route
                path={route('account')}
                exact
                element={
                    user !== null ? (
                        <AccountComponent />
                    ) : (
                        <Navigate
                            to={`${route('login')}?next=${encodeURIComponent(pathname)}`}
                            replace
                        />
                    )
                }
            />
            <Route path="*" elmeent={<ErrorComponent />} />
        </Routes>
    );
};
PanneauRoutes.propTypes = propTypes;
PanneauRoutes.defaultProps = defaultProps;

export default PanneauRoutes;
