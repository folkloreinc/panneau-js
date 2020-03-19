import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
// import ReactContainer from '@folklore/react-container';

import { createStore } from '@folklore/react-container';
import { IntlProvider } from 'react-intl';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { UrlGeneratorProvider } from '../lib/withUrlGenerator';

import defaultRoutes from '../defaults/routes.json';
import reducers from '../reducers/index';
import * as PanneauPropTypes from '../lib/PropTypes';
import parseDefinition from '../lib/parseDefinition';

import '../styles/vendor.global.scss';

import App from './App';

const propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    routes: PropTypes.objectOf(PropTypes.string),
    memoryRouter: PropTypes.bool,
    definition: PanneauPropTypes.definition.isRequired,
    componentsCollection: PanneauPropTypes.componentsCollection.isRequired,
    user: PanneauPropTypes.user,
};

const defaultProps = {
    locale: 'en',
    messages: {},
    routes: defaultRoutes,
    memoryRouter: false,
    user: null,
};

class Panneau extends Component {
    // eslint-disable-next-line class-methods-use-this
    getStoreProps() {
        const { definition, user, componentsCollection } = this.props;
        return {
            reducers,
            initialState: {
                panneau: {
                    definition: parseDefinition(definition),
                    componentsCollection,
                },
                auth: {
                    user,
                },
            },
        };
    }

    getIntlProps() {
        const { locale, messages } = this.props;
        return {
            locale,
            messages,
            textComponent: Fragment,
        };
    }

    getUrlGenerator() {
        const { routes, definition } = this.props;
        const definitionRoutes = get(definition, 'routes', {});
        const resources = get(definition, 'resources', []).filter(
            it => typeof it.routes !== 'undefined',
        );
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
            routes: {
                ...routes,
                ...definitionRoutes,
                ...resourcesRoutes,
            },
        };
    }

    getRouterProps() {
        const { memoryRouter } = this.props;
        return {
            memoryHistory: memoryRouter,
        };
    }

    render() {
        const { memoryRouter } = this.props;
        const Router = memoryRouter ? MemoryRouter : BrowserRouter;
        const store = this.getStoreProps();
        const intl = this.getIntlProps();
        const routerProps = this.getRouterProps();
        const urlGeneratorProps = this.getUrlGenerator();
        return (
            <ReduxProvider store={createStore(store.reducers, store.initialState)}>
                <IntlProvider {...intl}>
                    <Router {...routerProps}>
                        <UrlGeneratorProvider {...urlGeneratorProps}>
                            <App />
                        </UrlGeneratorProvider>
                    </Router>
                </IntlProvider>
            </ReduxProvider>
        );
    }
}

Panneau.propTypes = propTypes;
Panneau.defaultProps = defaultProps;

export default Panneau;
