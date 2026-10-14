import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import { type Media } from '@panneau/core';
import { type UseItemsResponse } from '@panneau/data';

export interface MediasApi {
    get: (
        query?: Record<string, unknown>,
        page?: number | null,
        count?: number | null,
    ) => Promise<UseItemsResponse<Media>>;
    create: (data: Partial<Media>) => Promise<Media>;
    find: (id: string) => Promise<Media>;
    update: (id: string, data: Partial<Media>) => Promise<Media>;
    destroy: (id: string) => Promise<unknown>;
    getTrashed?: (
        query?: Record<string, unknown>,
        page?: number | null,
        count?: number | null,
    ) => Promise<UseItemsResponse<Media>>;
    restore?: (id: string) => Promise<unknown>;
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
    return <MediasApiContext value={providedApi || previousApi}>{children}</MediasApiContext>;
}

export default MediasApiProvider;
