import { createPathToRegexpParser, useMemoryRouter } from '@folklore/routes';
import { ElementType, useCallback, useMemo } from 'react';
import { Router } from 'wouter';

import ActionsProvider from '@panneau/actions';
import { AuthProvider } from '@panneau/auth';
import type { PanneauDefinition, StatusCode, Uppy, User } from '@panneau/core';
import {
    ComponentsProvider,
    ModalProvider,
    PanneauProvider,
    RoutesProvider,
} from '@panneau/core/contexts';
import { ApiProvider, QueryProvider } from '@panneau/data';
import DisplaysProvider from '@panneau/displays';
import FieldsProvider from '@panneau/fields';
import FiltersProvider from '@panneau/filters';
import FormsProvider from '@panneau/forms';
import { IntlProvider } from '@panneau/intl';
import ListsProvider from '@panneau/lists';
import ModalsProvider from '@panneau/modals';
import { UppyProvider } from '@panneau/uppy';

import Routes from './Routes';

import '../styles/styles.css';

const pathToRegexpParser = createPathToRegexpParser();

const DEFAULT_ROUTES = {};
const DEFAULT_LOCALES: string[] = [];

interface ContainerProps {
    definition: PanneauDefinition;
    components?: Record<string, ElementType> | Record<string, Record<string, ElementType>> | null;
    user?: User | null;
    memoryRouter?: boolean;
    baseUrl?: string | null;
    uppy?: Uppy | null;
    statusCode?: StatusCode | null;
}

function Container({
    definition,
    components = null,
    user = null,
    memoryRouter = false,
    baseUrl = null,
    uppy = null,
    statusCode = null,
}: ContainerProps) {
    const {
        intl: { locale = 'en', locales = DEFAULT_LOCALES } = {},
        routes = DEFAULT_ROUTES,
        settings: { memoryRouter: usesMemoryRouter = false } = {},
    } = definition || {};

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
        window.location.href = baseUrl || '/';
    }, [baseUrl]);

    const onLogout = useCallback(() => {
        window.location.reload();
    }, []);

    const { hook: memoryLocationHook, searchHook: memorySearchHook } = useMemoryRouter();

    return (
        <Router
            hook={isMemoryRouter ? memoryLocationHook : undefined}
            searchHook={isMemoryRouter ? memorySearchHook : undefined}
            parser={pathToRegexpParser}
        >
            <IntlProvider locale={locale} locales={locales} extraMessages={extraMessages}>
                <PanneauProvider definition={definition}>
                    <UppyProvider {...uppy}>
                        <RoutesProvider routes={routes}>
                            <FieldsProvider>
                                <FormsProvider>
                                    <ListsProvider>
                                        <DisplaysProvider>
                                            <FiltersProvider>
                                                <ActionsProvider>
                                                    <ModalProvider>
                                                        <ModalsProvider>
                                                            <ApiProvider
                                                                baseUrl={baseUrl}
                                                                onUnauthorized={onUnauthorized}
                                                            >
                                                                <QueryProvider>
                                                                    <AuthProvider
                                                                        user={user}
                                                                        onLogout={onLogout}
                                                                    >
                                                                        <ComponentsProvider
                                                                            components={components}
                                                                        >
                                                                            <Routes
                                                                                statusCode={
                                                                                    statusCode
                                                                                }
                                                                            />
                                                                        </ComponentsProvider>
                                                                    </AuthProvider>
                                                                </QueryProvider>
                                                            </ApiProvider>
                                                        </ModalsProvider>
                                                    </ModalProvider>
                                                </ActionsProvider>
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
}

export default Container;
