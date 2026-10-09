import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, use, useState } from 'react';

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
    // Create the client only once, it holds the whole cache
    const [client] = useState(() => {
        const newClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: Infinity,
                },
            },
            ...initialConfig,
        });
        if (initialKey !== null && initialData !== null) {
            newClient.setQueryData(initialKey, initialData);
        }
        return newClient;
    });

    return (
        <QueryContext value={client}>
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </QueryContext>
    );
}

export default QueryContext;
