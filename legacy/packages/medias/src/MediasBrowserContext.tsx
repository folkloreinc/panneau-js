import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import { MediasBrowserProps } from './MediasBrowser';

interface MediasBrowserProviderProps extends Omit<MediasBrowserProps, 'children'> {
    children: ReactNode;
}

export type MediasBrowserContextValue = Omit<MediasBrowserProviderProps, 'children'>;

const MediasBrowserContext = createContext<MediasBrowserContextValue | null>(null);

export function useMediasBrowserContext(): MediasBrowserContextValue {
    return use(MediasBrowserContext) as MediasBrowserContextValue;
}

export function MediasBrowserProvider({ children, ...props }: MediasBrowserProviderProps) {
    return <MediasBrowserContext value={props}>{children}</MediasBrowserContext>;
}

export default MediasBrowserProvider;
