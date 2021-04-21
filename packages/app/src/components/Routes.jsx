import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router';
// import { parse as parseQuery } from 'query-string';
import {
    useRoutes,
    useUrlGenerator,
    usePanneau,
    usePanneauResources,
} from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { useUser } from '../contexts/AuthContext';

import * as basePages from './pages';

import ResourceRoutes from './ResourceRoutes';

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
    console.log('PATHNAME', pathname); // eslint-disable-line

    const [{ statusCode, pathname: initialPathname }, setInitialRequest] = useState({
        statusCode: initialStatusCode,
        pathname,
    });
    const user = useUser();
    const route = useUrlGenerator();
    const resources = usePanneauResources();

    // const nextUrl = useMemo(() => {
    //     const query = parseQuery(search);
    //     return query !== null ? query.next || null : null;
    // }, [search]);

    // TODO: set home page from a prop
    // const pageResource = resources.find((it) => it.id === 'pages') || null;
    // const pagesRoute = pageResource ? route('resources.index', { resource: 'pages' }) : '/';
    const homeUrl = route('home');

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
        <Switch>
            {statusCode !== null ? (
                <Route path="*" render={() => <ErrorComponent statusCode={statusCode} />} />
            ) : null}

            {user === null ? <Route path="*" exact component={LoginComponent} /> : null}

            {/* TODO fix this shit it doesnt work */}
            {/* {user !== null ? (
                <Redirect from={routes.login} to={nextUrl !== null ? nextUrl : homeUrl} exact />
            ) : (
                <Route path={routes.login} exact component={AuthLogin} />
            )} */}

            {user !== null ? (
                <Route path={routes.home} exact component={HomeComponent} />
            ) : (
                <Redirect from={routes.home} exact to={route('login')} />
            )}

            {resources.map((resource) => {
                const { id: resourceId, has_routes: hasRoutes } = resource || {};
                const routeName = hasRoutes ? `resources.${resourceId}` : 'resources.index';

                return user !== null ? (
                    <Route
                        key={`resource-${resourceId}`}
                        path={route(`${routeName}`, {
                            resource: resourceId,
                        })}
                        render={() => <ResourceRoutes resource={resource} />}
                    />
                ) : (
                    <Redirect
                        key={`resource-${resourceId}`}
                        from={route(`${routeName}.index`, {
                            resource: resourceId,
                        })}
                        to={`${route('login')}?next=${encodeURIComponent(pathname)}`}
                    />
                );
            })}
            <Route path={route('auth.account')} component={AccountComponent} />
            <Route path="*" component={ErrorComponent} />
        </Switch>
    );
};
PanneauRoutes.propTypes = propTypes;
PanneauRoutes.defaultProps = defaultProps;

export default PanneauRoutes;
