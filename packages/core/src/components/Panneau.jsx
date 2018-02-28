import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Route, Switch } from 'react-router';
import { createAppContainer } from '@folklore/react-app';
import createBrowserHistory from 'history/createBrowserHistory';
import createMemoryHistory from 'history/createMemoryHistory';
import 'bootstrap.native';

import defaultRoutes from '../defaults/routes.json';
import reducers from '../reducers/index';
import parseDefinition from '../lib/parseDefinition';

import Layout from './Layout';
import Home from './pages/Home';
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
    componentsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    definition: PropTypes.shape({
        layout: PropTypes.object,
        routes: PropTypes.objectOf(PropTypes.string),
    }),
};

const defaultProps = {
    componentsCollection: null,
    definition: null,
};

const childContextTypes = {
    componentsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    fieldsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    layoutsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    listsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
};

class Panneau extends Component {
    constructor(props) {
        super(props);

        this.renderResourceRoutes = this.renderResourceRoutes.bind(this);
    }

    getChildContext() {
        const { componentsCollection } = this.props;
        return {
            componentsCollection,
            fieldsCollection: componentsCollection.getCollection('fields'),
            layoutsCollection: componentsCollection.getCollection('layouts'),
            listsCollection: componentsCollection.getCollection('lists'),
        };
    }

    // eslint-disable-next-line class-methods-use-this
    renderResourceRoutes(routes, id) {
        return (
            <Switch key={`resource-route-${id}`}>
                <Route path={routes.index} component={ResourceIndex} />
                <Route path={routes.create} component={ResourceCreate} />
                <Route path={routes.show} component={ResourceShow} />
                <Route path={routes.edit} component={ResourceEdit} />
                <Route path={routes.delete} component={ResourceDelete} />
            </Switch>
        );
    }

    render() {
        const { urlGenerator, definition } = this.props;

        const defaultResourceRoutes = {
            index: urlGenerator.route('resource.index'),
            create: urlGenerator.route('resource.create'),
            show: urlGenerator.route('resource.show'),
            edit: urlGenerator.route('resource.edit'),
            delete: urlGenerator.route('resource.delete'),
        };

        const resourcesWithRoutes = get(definition, 'resources', []).filter((
            resource => typeof resource.routes !== 'undefined'
        ));

        return (
            <Layout>
                <Route exact path={urlGenerator.route('home')} component={Home} />
                {this.renderResourceRoutes(defaultResourceRoutes, 'default')}
                {resourcesWithRoutes.map(resource => (
                    this.renderResourceRoutes(resource.routes, resource.id)
                ))}
            </Layout>
        );
    }
}

Panneau.propTypes = propTypes;
Panneau.defaultProps = defaultProps;
Panneau.childContextTypes = childContextTypes;

/**
 * Container
 */
const containerPropTypes = {
    memoryRouter: PropTypes.bool,
    routes: PropTypes.objectOf(PropTypes.string),
};

const containerDefaultProps = {
    memoryRouter: false,
    routes: defaultRoutes,
};

const createRouterHistory = ({ memoryRouter }) => (
    memoryRouter ? createMemoryHistory() : createBrowserHistory()
);

const getStoreReducers = () => reducers;

const getStoreInitialState = ({ urlGenerator, componentsCollection, definition }) => {
    const cleanDefinition = parseDefinition(definition, {
        urlGenerator,
    });
    const layoutDefinition = get(cleanDefinition, 'layout', null);
    return {
        panneau: {
            definition: cleanDefinition,
            componentsCollection,
        },
        layout: {
            definition: {
                ...layoutDefinition,
            },
        },
    };
};

const getUrlGeneratorRoutes = ({ routes, definition }) => {
    const definitionRoutes = get(definition, 'routes', {});
    const resources = get(definition, 'resources', []).filter((
        it => typeof it.routes !== 'undefined'
    ));
    const resourcesRoutes = resources.reduce(
        (totalRoutes, resource) => ({
            ...totalRoutes,
            ...Object.keys(resource.routes).reduce(
                (mapRoutes, name) => ({
                    ...mapRoutes,
                    [`resource.${resource.id}.${name}`]: resource.routes[name],
                }),
                {},
            ),
        }),
        {},
    );
    return {
        ...routes,
        ...definitionRoutes,
        ...resourcesRoutes,
    };
};

export default createAppContainer({
    propTypes: containerPropTypes,
    defaultProps: containerDefaultProps,
    createRouterHistory,
    getUrlGeneratorRoutes,
    getStoreReducers,
    getStoreInitialState,
})(Panneau);
