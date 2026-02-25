/* eslint-disable react/jsx-props-no-spreading */
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

export interface MediasApi {
    get: (...args: unknown[]) => Promise<unknown> | unknown;
    getTrashed: (...args: unknown[]) => Promise<unknown> | unknown;
    create: (...args: unknown[]) => Promise<unknown> | unknown;
    find: (...args: unknown[]) => Promise<unknown> | unknown;
    update: (...args: unknown[]) => Promise<unknown> | unknown;
    trash: (...args: unknown[]) => Promise<unknown> | unknown;
    restore?: (...args: unknown[]) => Promise<unknown> | unknown;
    delete: (...args: unknown[]) => Promise<unknown> | unknown;
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
