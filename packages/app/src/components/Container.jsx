import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { PanneauProvider, RoutesProvider, LocalesProvider } from '@panneau/core/contexts';
import { ApiProvider } from '@panneau/data';
import FieldsProvider from '@panneau/fields';
import FormsProvider from '@panneau/forms';
import ListsProvider from '@panneau/lists';
import IndexesProvider from '@panneau/indexes';
import FiltersProvider from '@panneau/filters';
import { AuthProvider } from '../contexts/AuthContext';

import Routes from './Routes';

import '../styles/main.global.scss';

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
        intl: { locale = 'en', locales, messages: translations = {} } = {},
        routes = {},
        settings = {},
    } = definition;
    const { memoryRouter: usesMemoryRouter = false } = settings || {};
    const Router = memoryRouter || usesMemoryRouter ? MemoryRouter : BrowserRouter;
    // For storybook: auto load page with: initialEntries={['/pages/1/edit']} initialIndex={0}

    return (
        <Router>
            <PanneauProvider definition={definition}>
                <IntlProvider locale={locale} messages={translations[locale] || translations}>
                    <LocalesProvider locale={locale} locales={locales}>
                        <RoutesProvider routes={routes}>
                            <FieldsProvider>
                                <FormsProvider>
                                    <ListsProvider>
                                        <IndexesProvider>
                                            <FiltersProvider>
                                                <ApiProvider baseUrl={baseUrl}>
                                                    <AuthProvider user={user}>
                                                        <Routes statusCode={statusCode} />
                                                    </AuthProvider>
                                                </ApiProvider>
                                            </FiltersProvider>
                                        </IndexesProvider>
                                    </ListsProvider>
                                </FormsProvider>
                            </FieldsProvider>
                        </RoutesProvider>
                    </LocalesProvider>
                </IntlProvider>
            </PanneauProvider>
        </Router>
    );
};

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
