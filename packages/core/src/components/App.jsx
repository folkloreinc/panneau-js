import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import {
    Route, Switch, Redirect, withRouter,
} from 'react-router';
import { connect } from 'react-redux';
import queryString from 'query-string';
import 'bootstrap';

import { withUrlGenerator } from '@folklore/react-container';

import * as PanneauPropTypes from '../lib/PropTypes';

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
    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,
    urlGenerator: PropTypes.shape({
        route: PropTypes.func,
    }).isRequired,
    componentsCollection: PanneauPropTypes.componentsCollection,
    definition: PanneauPropTypes.definition,
    user: PanneauPropTypes.user,
};

const defaultProps = {
    componentsCollection: null,
    definition: null,
    user: null,
};

const childContextTypes = {
    definition: PanneauPropTypes.definition,
    componentsCollection: PanneauPropTypes.componentsCollection,
    fieldsCollection: PanneauPropTypes.componentsCollection,
    layoutsCollection: PanneauPropTypes.componentsCollection,
    listsCollection: PanneauPropTypes.componentsCollection,
    formsCollection: PanneauPropTypes.componentsCollection,
    modalsCollection: PanneauPropTypes.componentsCollection,
};

class App extends Component {
    constructor(props) {
        super(props);
        this.renderResourceRoutes = this.renderResourceRoutes.bind(this);
    }

    getChildContext() {
        const { definition, componentsCollection } = this.props;
        return {
            definition,
            componentsCollection,
            fieldsCollection: componentsCollection.getCollection('fields'),
            formsCollection: componentsCollection.getCollection('forms'),
            modalsCollection: componentsCollection.getCollection('modals'),
            layoutsCollection: componentsCollection.getCollection('layouts'),
            listsCollection: componentsCollection.getCollection('lists'),
        };
    }

    getResourceRoutes(id) {
        const { urlGenerator } = this.props;
        const prefix = typeof id !== 'undefined' ? `resource.${id}` : 'resource';
        return {
            index: urlGenerator.route(`${prefix}.index`),
            create: urlGenerator.route(`${prefix}.create`),
            show: urlGenerator.route(`${prefix}.show`),
            edit: urlGenerator.route(`${prefix}.edit`),
            delete: urlGenerator.route(`${prefix}.delete`),
        };
    }

    getResourcesActions() {
        const { urlGenerator, history } = this.props;
        const getResourceActionUrl = (resource, action, id) => (typeof resource.routes !== 'undefined'
            ? urlGenerator.route(`resource.${resource.id}.${action}`, {
                id: id || null,
            })
            : urlGenerator.route(`resource.${action}`, {
                resource: resource.id,
                id: id || null,
            }));
        return {
            getResourceActionUrl,
            gotoResourceAction: (...args) => history.push(getResourceActionUrl(...args)),
        };
    }

    createResourcePageRender(action) {
        const { definition, urlGenerator } = this.props;
        const { getResourceActionUrl, gotoResourceAction } = this.getResourcesActions();
        const { resources = [] } = definition;
        return ({ match, location }) => {
            const { resource: resourceId = null, id: itemId = null } = match.params;
            const resource = resources.find(
                it => (resourceId !== null && it.id === resourceId)
                        || (resourceId === null
                            && urlGenerator.route(`resource.${it.id}.${action}`, {
                                id: itemId,
                            }) === location.pathname),
            ) || null;
            const PageComponent = ResourcePages[action];
            const query = queryString.parse(location.search);
            return (
                <PageComponent
                    action={action}
                    query={query}
                    itemId={itemId}
                    resource={resource}
                    getResourceActionUrl={(...args) => getResourceActionUrl(resource, ...args)}
                    gotoResourceAction={(...args) => gotoResourceAction(resource, ...args)}
                />
            );
        };
    }

    renderResourceRoutes(routes, id) {
        return Object.keys(routes).map(action => (
            <Route
                key={`route-resource-${id}-${action}`}
                exact
                path={routes[action]}
                render={this.createResourcePageRender(action)}
            />
        ));
    }

    // eslint-disable-next-line class-methods-use-this
    renderAccountPage() {
        return <Account getResourceActionUrl={() => {}} gotoResourceAction={() => {}} />;
    }

    render() {
        const { urlGenerator, definition, user } = this.props;

        const defaultResourceRoutes = this.getResourceRoutes();

        const resourcesWithRoutes = get(definition, 'resources', []).filter(
            resource => typeof resource.routes !== 'undefined',
        );

        return (
            <Layout>
                <Switch>
                    {user !== null ? (
                        <Route
                            exact
                            path={urlGenerator.route('account')}
                            component={this.renderAccountPage}
                        />
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
                            ...this.renderResourceRoutes(
                                this.getResourceRoutes(resource.id),
                                resource.id,
                            ),
                        ],
                        [],
                    )}
                    {this.renderResourceRoutes(defaultResourceRoutes, 'default')}
                    <Route exact path={urlGenerator.route('home')} component={Home} />
                </Switch>
            </Layout>
        );
    }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
App.childContextTypes = childContextTypes;

const WithStateContainer = connect(({ panneau, auth }) => ({
    ...panneau,
    user: auth.user || null,
}))(App);
const WithUrlGenerator = withUrlGenerator(WithStateContainer);
const WithRouter = withRouter(WithUrlGenerator);
export default WithRouter;
