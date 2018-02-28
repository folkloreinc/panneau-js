import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Route, Switch } from 'react-router';
import 'bootstrap.native';

import createContainer from '../lib/createContainer';

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
                <Route exact path={routes.index} component={ResourceIndex} />
                <Route exact path={routes.create} component={ResourceCreate} />
                <Route exact path={routes.show} component={ResourceShow} />
                <Route exact path={routes.edit} component={ResourceEdit} />
                <Route exact path={routes.delete} component={ResourceDelete} />
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

export default createContainer(Panneau);
