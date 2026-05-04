import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import Api from './lib/Api';

import { ApiProvider } from './contexts/ApiContext';

interface DataProviderProps {
    api?: Api | null;
    apiBaseUrl?: string;
    children?: ReactNode;
}

function DataProvider({ api = null, apiBaseUrl = undefined, children = null }: DataProviderProps) {
    const [client] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={client}>
            <ApiProvider api={api} baseUrl={apiBaseUrl}>
                {children}
            </ApiProvider>
        </QueryClientProvider>
    );
}

export default DataProvider;
