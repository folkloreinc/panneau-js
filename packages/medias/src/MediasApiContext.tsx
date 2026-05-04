/* eslint-disable react/jsx-props-no-spreading */
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

import { type Media } from '@panneau/core';

export interface MediasApi {
    get: (
        query?: Record<string, unknown>,
        page?: number | null,
        count?: number | null,
    ) => Promise<unknown>;
    getTrashed: (
        query?: Record<string, unknown>,
        page?: number | null,
        count?: number | null,
    ) => Promise<unknown>;
    create: (data: Partial<Media>) => Promise<Media>;
    find: (id: string) => Promise<Media>;
    update: (id: string, data: Partial<Media>) => Promise<Media>;
    trash: (id: string) => Promise<unknown>;
    restore?: (id: string) => Promise<unknown>;
    delete: (id: string) => Promise<unknown>;
}

interface MediasApiProviderProps {
    api?: MediasApi | null;
    children: ReactNode;
}

const MediasApiContext = createContext<MediasApi | null>(null);

export function useMediasApi() {
    return use(MediasApiContext);
}

export function MediasApiProvider({ api: providedApi = null, children }: MediasApiProviderProps) {
    const previousApi = useMediasApi();
    const api = useMemo(() => providedApi || previousApi, [providedApi, previousApi]);
    return <MediasApiContext value={api}>{children}</MediasApiContext>;
}

export default MediasApiProvider;
