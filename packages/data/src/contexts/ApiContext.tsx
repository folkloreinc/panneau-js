import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import { useRoutes, useUrlGenerator } from '@panneau/core/contexts';

import Api from '../lib/Api';

const ApiContext = createContext<Api | null>(null);

export function useApi() {
    return use(ApiContext);
}

interface ApiProviderProps {
    api?: Api | null;
    baseUrl?: string;
    onUnauthorized?: (() => void) | null;
    routes?: Record<string, string> | null;
    children: ReactNode;
}

export function ApiProvider({
    api: initialApi = null,
    baseUrl = undefined,
    onUnauthorized = null,
    routes: apiRoutes = undefined,
    children,
}: ApiProviderProps) {
    const generateUrl = useUrlGenerator();
    const previousApi = useApi();
    const contextRoutes = useRoutes();
    const api =
        initialApi ||
        previousApi ||
        new Api({
            baseUrl,
            generateUrl,
            routes: apiRoutes || contextRoutes,
            onUnauthorized,
        });
    return <ApiContext value={api}>{children}</ApiContext>;
}

export default ApiContext;
