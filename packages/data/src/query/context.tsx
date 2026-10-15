import { type ReactNode, createContext, use } from 'react';

import type { DataAdapter } from '../adapter';

const DataAdapterContext = createContext<DataAdapter | null>(null);

export interface DataAdapterProviderProps {
    /** The adapter of the hooks below: `createRestAdapter()`, a preset or a custom adapter. */
    adapter: DataAdapter;
    children?: ReactNode;
}

/**
 * Provides the adapter used by the query hooks. The hooks also need TanStack Query's
 * `QueryClientProvider` above them.
 */
export function DataAdapterProvider({ adapter, children }: DataAdapterProviderProps) {
    return <DataAdapterContext value={adapter}>{children}</DataAdapterContext>;
}

/** The adapter of the closest `DataAdapterProvider`. */
export function useDataAdapter(): DataAdapter {
    const adapter = use(DataAdapterContext);
    if (adapter === null) {
        throw new Error('useDataAdapter() needs a <DataAdapterProvider> above it.');
    }
    return adapter;
}
