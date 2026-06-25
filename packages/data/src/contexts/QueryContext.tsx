import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, use } from 'react';

type QueryInitialData = Record<string, unknown> | Array<Record<string, unknown>>;

interface QueryProviderProps {
    config?: QueryClientConfig | null;
    initialKey?: string[] | null;
    initialData?: QueryInitialData | null;
    children: ReactNode;
}

const QueryContext = createContext<QueryClient | null>(null);

export function useQueryContext() {
    return use(QueryContext);
}

export function QueryProvider({
    config: initialConfig = null,
    initialKey = null,
    initialData = null,
    children,
}: QueryProviderProps) {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
            },
        },
        ...initialConfig,
    });

    if (initialKey !== null && initialData !== null) {
        client.setQueryData(initialKey, initialData);
    }

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default QueryContext;
