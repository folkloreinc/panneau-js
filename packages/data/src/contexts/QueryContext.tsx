/* eslint-disable react/jsx-props-no-spreading */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

type QueryInitialData = Record<string, unknown> | Array<Record<string, unknown>>;

interface QueryProviderProps {
    config?: Record<string, unknown> | null;
    initialKey?: string[] | null;
    initialData?: QueryInitialData | null;
    children: ReactNode;
}

const QueryContext = createContext<QueryClient | null>(null);

export const useQueryContext = () => use(QueryContext);

export const QueryProvider = ({
    config: initialConfig = null,
    initialKey = null,
    initialData = null,
    children,
}: QueryProviderProps) => {
    const queryClient = useMemo(() => {
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
        return client;
    }, [initialConfig]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryContext;
