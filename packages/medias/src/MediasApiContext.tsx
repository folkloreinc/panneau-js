/* eslint-disable react/jsx-props-no-spreading */
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

import { type Media } from '@panneau/core';

export interface MediasApi {
    get: (...args: unknown[]) => Promise<unknown>;
    getTrashed: (...args: unknown[]) => Promise<unknown>;
    create: (...args: unknown[]) => Promise<Media>;
    find: (...args: unknown[]) => Promise<Media>;
    update: (...args: unknown[]) => Promise<Media>;
    trash: (...args: unknown[]) => Promise<unknown>;
    restore?: (...args: unknown[]) => Promise<unknown>;
    delete: (...args: unknown[]) => Promise<unknown>;
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
