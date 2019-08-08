import React from 'react';
// import PropTypes from 'prop-types';
import { Route, Switch, Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator, useDefinition } from '@panneau/core/contexts';
import 'bootstrap';

import Layout from './Layout';
import Home from './pages/Home';
import Account from './pages/Account';
import ResourceIndex from './pages/ResourceIndex';
import ResourceCreate from './pages/ResourceCreate';
import ResourceShow from './pages/ResourceShow';
import ResourceEdit from './pages/ResourceEdit';
import ResourceDelete from './pages/ResourceDelete';

const ResourcePages = {
    index: ResourceIndex,
    create: ResourceCreate,
    show: ResourceShow,
    edit: ResourceEdit,
    delete: ResourceDelete,
};

const propTypes = {
    history: PanneauPropTypes.history.isRequired,
    user: PanneauPropTypes.user,
};

const defaultProps = {
    user: null,
};

const App = ({ history, user }) => {
    const urlGenerator = useUrlGenerator();
    const { resources = [] } = useDefinition();
    const resourcesWithRoutes = resources.filter(
        resource => typeof resource.routes !== 'undefined',
    );

    const getResourceActionUrl = ({ id: resourceId, routes = null }, action, id) =>
        routes !== null
            ? urlGenerator.route(`resource.${resourceId}.${action}`, {
                  id: id || null,
              })
            : urlGenerator.route(`resource.${action}`, {
                  resource: resourceId,
                  id: id || null,
              });

    const getResourceRoutes = (id = null) => {
        const prefix = id !== null ? `resource.${id}` : 'resource';
        return {
            index: urlGenerator.route(`${prefix}.index`),
            create: urlGenerator.route(`${prefix}.create`),
            show: urlGenerator.route(`${prefix}.show`),
            edit: urlGenerator.route(`${prefix}.edit`),
            delete: urlGenerator.route(`${prefix}.delete`),
        };
    };

    const gotoResourceAction = (...args) => history.push(getResourceActionUrl(...args));

    const renderResourceRoutes = (routes, id) =>
        Object.keys(routes).map(action => (
            <Route
                key={`route-resource-${id}-${action}`}
                exact
                path={routes[action]}
                render={(
                    {
                        match: {
                            params: { resource: resourceId = null, id: itemId = null },
                        },
                        location: { pathname, search },
                    },
                ) => {
                    const resource =
                        resources.find(
                            it =>
                                (resourceId !== null && it.id === resourceId) ||
                                (resourceId === null &&
                                    urlGenerator.route(`resource.${it.id}.${action}`, {
                                        id: itemId,
                                    }) === pathname),
                        ) || null;
                    const PageComponent = ResourcePages[action];
                    const query = queryString.parse(search);
                    return (
                        <PageComponent
                            action={action}
                            query={query}
                            itemId={itemId}
                            resource={resource}
                            getResourceActionUrl={(...args) =>
                                getResourceActionUrl(resource, ...args)
                            }
                            gotoResourceAction={(...args) => gotoResourceAction(resource, ...args)}
                        />
                    );
                }}
            />
        ));

    const defaultResourceRoutes = getResourceRoutes();

    return (
        <Layout>
            <Switch>
                {user !== null ? (
                    <Route exact path={urlGenerator.route('account')} component={Account} />
                ) : (
                    <Route
                        exact
                        path={urlGenerator.route('account')}
                        render={() => (
                            <Redirect
                                to={{
                                    pathname: urlGenerator.route('home'),
                                }}
                            />
                        )}
                    />
                )}
                {resourcesWithRoutes.reduce(
                    (routes, resource) => [
                        ...routes,
                        ...renderResourceRoutes(getResourceRoutes(resource.id), resource.id),
                    ],
                    [],
                )}
                {renderResourceRoutes(defaultResourceRoutes, 'default')}
                <Route exact path={urlGenerator.route('home')} component={Home} />
            </Switch>
        </Layout>
    );
};

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const WithStateContainer = connect(({ auth }) => ({
    user: auth.user || null,
}))(App);
const WithRouter = withRouter(WithStateContainer);
export default WithRouter;
