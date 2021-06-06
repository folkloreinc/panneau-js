import React, { useState, useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { PanneauProvider, RoutesProvider } from '@panneau/core/contexts';
import { IntlProvider } from '@panneau/intl';
import { ApiProvider } from '@panneau/data';
import FieldsProvider from '@panneau/fields';
import FormsProvider from '@panneau/forms';
import ListsProvider from '@panneau/lists';
import DisplaysProvider from '@panneau/displays';
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

    return (
        <Router>
            <PanneauProvider definition={definition}>
                <IntlProvider locale={locale} locales={locales} extraMessages={translations}>
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
                </IntlProvider>
            </PanneauProvider>
        </Router>
    );
};

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
