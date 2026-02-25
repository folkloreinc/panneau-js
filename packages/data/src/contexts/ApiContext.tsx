/* eslint-disable react/jsx-props-no-spreading */
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

import { useUrlGenerator } from '@panneau/core/contexts';

import Api from '../lib/Api';

interface ApiProviderProps {
    api?: Api | null;
    baseUrl?: string;
    onUnauthorized?: (() => void) | null;
    children: ReactNode;
}

const ApiContext = createContext<Api | null>(null);

export function useApi() {
    return use(ApiContext);
}

export function ApiProvider({
    api: initialApi = null,
    baseUrl = undefined,
    onUnauthorized = null,
    children,
}: ApiProviderProps) {
    const generateUrl = useUrlGenerator();
    const previousApi = useApi();
    const api = useMemo(
        () =>
            initialApi ||
            previousApi ||
            new Api({
                baseUrl,
                generateUrl,
                onUnauthorized,
            }),
        [previousApi, initialApi, baseUrl],
    );
    return <ApiContext value={api}>{children}</ApiContext>;
}

export default ApiContext;
