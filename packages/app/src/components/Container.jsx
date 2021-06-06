import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { PanneauProvider, RoutesProvider } from '@panneau/core/contexts';
import { ApiProvider } from '@panneau/data';
import DisplaysProvider from '@panneau/displays';
import FieldsProvider from '@panneau/fields';
import FiltersProvider from '@panneau/filters';
import FormsProvider from '@panneau/forms';
import { IntlProvider } from '@panneau/intl';
import ListsProvider from '@panneau/lists';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { MemoryRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/styles.scss';
import Routes from './Routes';

const propTypes = {
    definition: PanneauPropTypes.panneauDefinition.isRequired,
    user: PanneauPropTypes.user,
    memoryRouter: PropTypes.bool,
    baseUrl: PropTypes.string,
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    user: null,
    memoryRouter: false,
    baseUrl: null,
    statusCode: null,
};

const Container = ({ definition, user, memoryRouter, baseUrl, statusCode }) => {
    const {
        intl: { locale = 'en', locales } = {},
        routes = {},
        settings: { memoryRouter: usesMemoryRouter = false } = {},
    } = definition;
    const Router = memoryRouter || usesMemoryRouter ? MemoryRouter : BrowserRouter;
    const extraMessages = useMemo(() => {
        const { intl: { messages = null } = {}, resources = [] } = definition;
        return {
            ...messages,
            ...resources.reduce(
                (allMessages, { id, intl: { messages: resourceMessages = {} } = {} }) => ({
                    ...allMessages,
                    ...Object.keys(resourceMessages).reduce(
                        (allResourceMessages, key) => ({
                            ...allResourceMessages,
                            [`resources.${id}.${key}`]: resourceMessages[key],
                        }),
                        {},
                    ),
                }),
                {},
            ),
        };
    }, definition);

    return (
        <Router>
            <IntlProvider locale={locale} locales={locales} extraMessages={extraMessages}>
                <PanneauProvider definition={definition}>
                    <RoutesProvider routes={routes}>
                        <FieldsProvider>
                            <FormsProvider>
                                <ListsProvider>
                                    <DisplaysProvider>
                                        <FiltersProvider>
                                            <ApiProvider baseUrl={baseUrl}>
                                                <AuthProvider user={user}>
                                                    <Routes statusCode={statusCode} />
                                                </AuthProvider>
                                            </ApiProvider>
                                        </FiltersProvider>
                                    </DisplaysProvider>
                                </ListsProvider>
                            </FormsProvider>
                        </FieldsProvider>
                    </RoutesProvider>
                </PanneauProvider>
            </IntlProvider>
        </Router>
    );
};

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
