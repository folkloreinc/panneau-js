import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import {
    Route, Switch, Redirect, withRouter,
} from 'react-router';
import { connect } from 'react-redux';
import 'bootstrap';

import * as PanneauPropTypes from '../lib/PropTypes';
import withUrlGenerator from '../lib/withUrlGenerator';
// import createContainer from '../lib/createContainer';

import Layout from './Layout';
import Home from './pages/Home';
import Account from './pages/Account';
import ResourceIndex from './pages/ResourceIndex';
import ResourceCreate from './pages/ResourceCreate';
import ResourceShow from './pages/ResourceShow';
import ResourceEdit from './pages/ResourceEdit';
import ResourceDelete from './pages/ResourceDelete';

import '../styles/vendor.global.scss';

const propTypes = {
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

    // eslint-disable-next-line class-methods-use-this
    renderResourceRoutes(routes, id) {
        return [
            <Route
                key={`route-resource-${id}-index`}
                exact
                path={routes.index}
                component={ResourceIndex}
            />,
            <Route
                key={`route-resource-${id}-create`}
                exact
                path={routes.create}
                component={ResourceCreate}
            />,
            <Route
                key={`route-resource-${id}-show`}
                exact
                path={routes.show}
                component={ResourceShow}
            />,
            <Route
                key={`route-resource-${id}-edit`}
                exact
                path={routes.edit}
                component={ResourceEdit}
            />,
            <Route
                key={`route-resource-${id}-delete`}
                exact
                path={routes.delete}
                component={ResourceDelete}
            />,
        ];
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

// export default createContainer(App);
const WithStateContainer = connect(({ panneau, auth }) => ({
    ...panneau,
    user: auth.user || null,
}))(App);
const WithUrlGenerator = withUrlGenerator()(WithStateContainer);
const WithRouter = withRouter(WithUrlGenerator);
export default WithRouter;
