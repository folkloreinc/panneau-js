/* eslint-disable react/jsx-props-no-spreading */
import type { Media } from '@panneau/core';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import MediasBrowser from './MediasBrowser';

interface MediasBrowserContainerProps {
    api?: MediasApi | null;
    media?: Media | null;
    [key: string]: unknown;
}

function MediasBrowserContainer({
    api = null,
    media = null,
    ...props
}: MediasBrowserContainerProps) {
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasBrowser {...props} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

export default MediasBrowserContainer;
