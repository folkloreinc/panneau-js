/* eslint-disable react/jsx-props-no-spreading */
import { createPathToRegexpMatcher, useMemoryLocationHook } from '@folklore/routes';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { Router } from 'wouter';

import { AuthProvider } from '@panneau/auth';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import {
    ComponentsProvider,
    ModalProvider,
    PanneauProvider,
    RoutesProvider,
} from '@panneau/core/contexts';
import {
    UppyProvider,
} from '@panneau/uppy';
import { ApiProvider } from '@panneau/data';
import DisplaysProvider from '@panneau/displays';
import FieldsProvider from '@panneau/fields';
import FiltersProvider from '@panneau/filters';
import FormsProvider from '@panneau/forms';
import { IntlProvider } from '@panneau/intl';
import ListsProvider from '@panneau/lists';
import ModalsProvider from '@panneau/modals';

import Routes from './Routes';

import '../styles/styles.scss';

const pathToRegexpMatcher = createPathToRegexpMatcher();

const propTypes = {
    definition: PanneauPropTypes.panneauDefinition.isRequired,
    components: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.elementType),
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.elementType)),
    ]),
    user: PanneauPropTypes.user,
    memoryRouter: PropTypes.bool,
    baseUrl: PropTypes.string,
    uppy: PanneauPropTypes.uppy,
    statusCode: PanneauPropTypes.statusCode,
};

const defaultProps = {
    components: null,
    user: null,
    memoryRouter: false,
    baseUrl: null,
    uppy: null,
    statusCode: null,
};

const Container = ({ definition, components, user, memoryRouter, baseUrl, uppy, statusCode }) => {
    const {
        intl: { locale = 'en', locales = [] } = {},
        routes = {},
        settings: { memoryRouter: usesMemoryRouter = false } = {},
    } = definition;
    const isMemoryRouter = memoryRouter || usesMemoryRouter || false;
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
    }, [definition]);

    const onUnauthorized = useCallback(() => {
        window.location.href = baseUrl;
    }, [baseUrl]);

    const onLogout = useCallback(() => {
        window.location.reload();
    }, [baseUrl]);

    const memoryLocationHook = useMemoryLocationHook();

    return (
        <Router hook={isMemoryRouter ? memoryLocationHook : null} matcher={pathToRegexpMatcher}>
            <IntlProvider locale={locale} locales={locales} extraMessages={extraMessages}>
                <PanneauProvider definition={definition}>
                    <UppyProvider {...uppy}>
                        <RoutesProvider routes={routes}>
                            <FieldsProvider>
                                <FormsProvider>
                                    <ListsProvider>
                                        <DisplaysProvider>
                                            <FiltersProvider>
                                                <ModalProvider>
                                                    <ModalsProvider>
                                                        <ApiProvider
                                                            baseUrl={baseUrl}
                                                            onUnauthorized={onUnauthorized}
                                                        >
                                                            <AuthProvider
                                                                user={user}
                                                                onLogout={onLogout}
                                                            >
                                                                <ComponentsProvider
                                                                    components={components}
                                                                >
                                                                    <Routes
                                                                        statusCode={statusCode}
                                                                    />
                                                                </ComponentsProvider>
                                                            </AuthProvider>
                                                        </ApiProvider>
                                                    </ModalsProvider>
                                                </ModalProvider>
                                            </FiltersProvider>
                                        </DisplaysProvider>
                                    </ListsProvider>
                                </FormsProvider>
                            </FieldsProvider>
                        </RoutesProvider>
                    </UppyProvider>
                </PanneauProvider>
            </IntlProvider>
        </Router>
    );
};

Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
