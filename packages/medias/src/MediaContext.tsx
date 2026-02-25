/* eslint-disable react/jsx-props-no-spreading */
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, use, useMemo, useState } from 'react';

import type { Media } from '@panneau/core';

export interface MediaContextValue {
    currentMedia: Media | null;
    setCurrentMedia: Dispatch<SetStateAction<Media | null>>;
}

interface MediaProviderProps {
    media?: Media | null;
    children: ReactNode;
}

const MediaContext = createContext<MediaContextValue | null>(null);

export function useCurrentMedia(): MediaContextValue {
    return use(MediaContext) as MediaContextValue;
}

export function MediaProvider({ media: providedMedia = null, children }: MediaProviderProps) {
    const [currentMedia, setCurrentMedia] = useState(providedMedia);
    const values = useMemo(
        () => ({ currentMedia, setCurrentMedia }),
        [currentMedia, setCurrentMedia],
    );
    return <MediaContext value={values}>{children}</MediaContext>;
}

export default MediaProvider;
