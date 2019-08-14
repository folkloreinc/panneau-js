import React, { useCallback } from 'react';
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

const defaultProps = { user: null };

const App = ({ history, user }) => {
    const urlGenerator = useUrlGenerator();
    const definition = useDefinition();
    const resources = definition.resources();

    const getResourceActionUrl = useCallback(
        (resource, action, id) => urlGenerator.resource(resource, action, id),
        [urlGenerator],
    );

    const gotoResourceAction = (...args) => history.push(getResourceActionUrl(...args));

    const renderResourceRoutes = (resource = null) => {
        const id = resource !== null ? resource.id() : 'default';
        return Object.keys(ResourcePages).map(action => (
            <Route
                key={`resource-${id}-${action}`}
                exact
                path={urlGenerator.resource(resource, action)}
                render={({
                    match: {
                        params: { resource: resourceId = null, id: itemId = null },
                    },
                    location: { search },
                }) => {
                    const query = queryString.parse(search);
                    const matchedResource =
                        resource ||
                        resources.find(it => resourceId !== null && it.id() === resourceId) ||
                        null;

                    const PageComponent = ResourcePages[action];
                    return (
                        <PageComponent
                            action={action}
                            query={query}
                            itemId={itemId}
                            resource={matchedResource}
                            getResourceActionUrl={(...args) =>
                                getResourceActionUrl(matchedResource, ...args)
                            }
                            gotoResourceAction={(...args) =>
                                gotoResourceAction(matchedResource, ...args)
                            }
                        />
                    );
                }}
            />
        ));
    };

    return (
        <Layout>
            <Switch>
                {user !== null ? (
                    <Route
                        exact
                        path={urlGenerator.route('account')}
                        render={() => <Account resource={definition.resource('users')} />}
                    />
                ) : (
                    <Route
                        exact
                        path={urlGenerator.route('account')}
                        render={() => <Redirect to={urlGenerator.route('home')} />}
                    />
                )}
                {resources
                    .filter(resource => resource.hasRoutes())
                    .reduce(
                        (routes, resource) => [...routes, ...renderResourceRoutes(resource)],
                        [],
                    )}
                {renderResourceRoutes()}
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
