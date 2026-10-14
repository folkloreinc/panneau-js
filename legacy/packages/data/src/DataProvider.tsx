import { QueryClientConfig } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import Api from './lib/Api';

import { ApiProvider } from './contexts/ApiContext';
import { QueryProvider } from './contexts/QueryContext';

interface DataProviderProps {
    api?: Api | null;
    apiBaseUrl?: string;
    routes?: Record<string, string> | null;
    baseUrl?: string;
    queryConfig?: QueryClientConfig | null;
    initialQueryKey?: string[] | null;
    initialQueryData?: Record<string, unknown> | Array<Record<string, unknown>> | null;
    onUnauthorized?: (() => void) | null;
    children?: ReactNode;
}

function DataProvider({
    api = null,
    apiBaseUrl = undefined,
    routes = undefined,
    baseUrl = undefined,
    children = null,
    queryConfig = null,
    initialQueryKey = null,
    initialQueryData = null,
    onUnauthorized = null,
}: DataProviderProps) {
    return (
        <QueryProvider
            config={queryConfig}
            initialKey={initialQueryKey}
            initialData={initialQueryData}
        >
            <ApiProvider
                api={api}
                baseUrl={baseUrl ?? apiBaseUrl}
                routes={routes}
                onUnauthorized={onUnauthorized}
            >
                {children}
            </ApiProvider>
        </QueryProvider>
    );
}

export default DataProvider;
