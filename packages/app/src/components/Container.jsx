import React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
// import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import { PanneauProvider, RoutesProvider } from '@panneau/core/contexts';
import { ApiProvider, AuthProvider } from '@panneau/data';
import { FieldsProvider } from '@panneau/fields';
import { FormsProvider } from '@panneau/forms';

import Routes from './Routes';

const propTypes = {
    definition: PanneauPropTypes.panneauDefinition.isRequired,
    user: PanneauPropTypes.user,
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    user: null,
    statusCode: null,
};

const Container = ({ definition, user, statusCode }) => {
    const {
        localization: { locale = 'en', messages: translations = {} } = {},
        routes = {},
    } = definition;

    return (
        <PanneauProvider definition={definition}>
            <IntlProvider locale={locale} messages={translations[locale] || translations}>
                <BrowserRouter>
                    <FieldsProvider>
                        <FormsProvider>
                            <RoutesProvider routes={routes}>
                                <ApiProvider>
                                    <AuthProvider user={user}>
                                        <Routes statusCode={statusCode} />
                                    </AuthProvider>
                                </ApiProvider>
                            </RoutesProvider>
                        </FormsProvider>
                    </FieldsProvider>
                </BrowserRouter>
            </IntlProvider>
        </PanneauProvider>
    );
};

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
