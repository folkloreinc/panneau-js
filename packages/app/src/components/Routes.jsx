import { useUser } from '@panneau/auth';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import { parse as parseQuery } from 'query-string';
import {
    usePanneau,
    usePanneauResources,
    useRoutes,
    useUrlGenerator,
} from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router';
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
                const { id: resourceId } = resource || {};
                return user !== null ? (
                    <Route
                        key={`resource-${resourceId}`}
                        path={route('resources.index', {
                            resource: resourceId,
                        })}
                        render={() => <ResourceRoutes resource={resource} />}
                    />
                ) : (
                    <Redirect
                        key={`resource-${resourceId}`}
                        from={route('resources.index', {
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
