import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router';
// import { parse as parseQuery } from 'query-string';
import { useRoutes, useUrlGenerator, usePanneauResources } from '@panneau/core/contexts';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { useUser } from '../contexts/AuthContext';

import AuthLogin from './pages/AuthLogin';
import Home from './pages/Home';
import Error from './pages/Error';

import ResourceRoutes from './ResourceRoutes';

const propTypes = {
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    statusCode: null,
};

const PanneauRoutes = ({ statusCode: initialStatusCode }) => {
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
    const pageResource = resources.find((it) => it.id === 'pages') || null;
    const pagesRoute = pageResource ? route('resources.index', { resource: 'pages' }) : '/';
    const homeUrl = pagesRoute;

    useEffect(() => {
        if (pathname !== initialPathname) {
            setInitialRequest({
                pathname,
                statusCode: null,
            });
        }
    }, [pathname, initialPathname]);

    return (
        <Switch>
            {statusCode !== null ? (
                <Route path="*" render={() => <Error statusCode={statusCode} />} />
            ) : null}

            {user === null ? <Route path="*" exact component={AuthLogin} /> : null}

            {/* TODO fix this shit it doesnt work */}
            {/* {user !== null ? (
                <Redirect from={routes.login} to={nextUrl !== null ? nextUrl : homeUrl} exact />
            ) : (
                <Route path={routes.login} exact component={AuthLogin} />
            )} */}

            {user !== null ? (
                <Redirect from={routes.home} exact to={homeUrl} component={Home} />
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

            <Route path="*" component={Home} />
        </Switch>
    );
};
PanneauRoutes.propTypes = propTypes;
PanneauRoutes.defaultProps = defaultProps;

export default PanneauRoutes;
