import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import 'bootstrap.native';

import defaultRoutes from '../defaults/routes.json';
import parseDefinition from '../lib/parseDefinition';

import Container from './Container';

import '../styles/vendor.global.scss';

const propTypes = {
    locale: PropTypes.string,
    componentsCollection: PropTypes.shape({
        getComponent: PropTypes.func,
    }),
    definition: PropTypes.shape({
        layout: PropTypes.object,
    }),
    routes: PropTypes.objectOf(PropTypes.string),
    messages: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
    locale: 'en',
    componentsCollection: null,
    definition: null,
    routes: defaultRoutes,
    messages: {},
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

        this.getStoreInitialState = this.getStoreInitialState.bind(this);

        this.refContainer = null;
        this.store = null;
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

    getStoreInitialState({ urlGenerator }) {
        const {
            componentsCollection,
            definition,
        } = this.props;
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
    }

    getRoutes() {
        const { routes, definition } = this.props;
        const definitionRoutes = get(definition, 'routes', {});
        const resources = get(definition, 'resources', [])
            .filter(it => typeof it.routes !== 'undefined');
        const resourcesRoutes = resources.reduce((totalRoutes, resource) => ({
            ...totalRoutes,
            ...(Object.keys(resource.routes).reduce((mapRoutes, name) => ({
                ...mapRoutes,
                [`resource.${resource.id}.${name}`]: resource.routes[name],
            }), {})),
        }), {});
        return {
            ...routes,
            ...definitionRoutes,
            ...resourcesRoutes,
        };
    }

    render() {
        const routes = this.getRoutes();

        return (
            <Container
                {...this.props}
                ref={(ref) => { this.refContainer = ref; }}
                getStoreInitialState={this.getStoreInitialState}
                routes={routes}
            />
        );
    }
}

Panneau.propTypes = propTypes;
Panneau.defaultProps = defaultProps;
Panneau.childContextTypes = childContextTypes;

export default Panneau;
