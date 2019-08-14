import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { Router } from 'react-router';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { PropTypes as PanneauPropTypes, Definition } from '@panneau/core';
import {
    DefinitionProvider,
    UrlGeneratorProvider,
    ComponentsProvider,
} from '@panneau/core/contexts';
import { Provider as ReduxProvider } from 'react-redux';

import defaultRoutes from '../defaults/routes.json';
import reducers from '../reducers/index';
import createStore from '../lib/createStore';

import '../styles/vendor.global.scss';

import App from './App';

window.parent.React2 = React;

const propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    routes: PropTypes.objectOf(PropTypes.string),
    memoryRouter: PropTypes.bool,
    definition: PanneauPropTypes.definitions.definition.isRequired,
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

const Panneau = ({
    locale,
    messages,
    memoryRouter,
    routes,
    definition: definitionData,
    componentsCollection,
    user,
}) => {
    const store = useMemo(
        () =>
            createStore(reducers, {
                auth: {
                    user,
                },
            }),
        [],
    );

    const history = useMemo(() => (memoryRouter ? createMemoryHistory() : createBrowserHistory()), [
        memoryRouter,
    ]);

    const definition = useMemo(() => new Definition(definitionData), [definitionData]);

    const allRoutes = useMemo(
        () => ({
            ...routes,
            ...definition.allRoutes(),
        }),
        [routes, definition],
    );

    return (
        <ReduxProvider store={store}>
            <IntlProvider locale={locale} messages={messages}>
                <Router history={history}>
                    <DefinitionProvider definition={definition}>
                        <UrlGeneratorProvider routes={allRoutes}>
                            <ComponentsProvider collection={componentsCollection}>
                                <App />
                            </ComponentsProvider>
                        </UrlGeneratorProvider>
                    </DefinitionProvider>
                </Router>
            </IntlProvider>
        </ReduxProvider>
    );
};

Panneau.propTypes = propTypes;
Panneau.defaultProps = defaultProps;

export default Panneau;
