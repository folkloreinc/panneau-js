import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { PanneauProvider, RoutesProvider } from '@panneau/core/contexts';
import { ApiProvider } from '@panneau/data';
import FieldsProvider from '@panneau/fields';
import FormsProvider from '@panneau/forms';
import ListsProvider from '@panneau/lists';
import FiltersProvider from '@panneau/filters';
import { AuthProvider } from '../contexts/AuthContext';

import Routes from './Routes';

import '../styles/main.global.scss';

const propTypes = {
    definition: PanneauPropTypes.panneauDefinition.isRequired,
    user: PanneauPropTypes.user,
    memoryRouter: PropTypes.bool,
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    user: null,
    memoryRouter: false,
    statusCode: null,
};

const Container = ({ definition, user, memoryRouter, statusCode }) => {
    const {
        intl: { locale = 'en', messages: translations = {} } = {},
        routes = {},
        settings = {},
    } = definition;
    const { memoryRouter: usesMemoryRouter = false } = settings || {};

    const Router = memoryRouter || usesMemoryRouter ? MemoryRouter : BrowserRouter;

    // For storybook: auto load page with: initialEntries={['/pages/1/edit']} initialIndex={0}

    return (
        <Router initialEntries={['/pages/1/edit']} initialIndex={0}>
            <PanneauProvider definition={definition}>
                <IntlProvider locale={locale} messages={translations[locale] || translations}>
                    <RoutesProvider routes={routes}>
                        <FieldsProvider>
                            <FormsProvider>
                                <ListsProvider>
                                    <FiltersProvider>
                                        <ApiProvider>
                                            <AuthProvider user={user}>
                                                <Routes statusCode={statusCode} />
                                            </AuthProvider>
                                        </ApiProvider>
                                    </FiltersProvider>
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
