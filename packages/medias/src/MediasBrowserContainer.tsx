import type { Media } from '@panneau/core';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import MediasBrowser, { MediasBrowserProps } from './MediasBrowser';

export interface MediasBrowserContainerProps extends MediasBrowserProps {
    api?: MediasApi | null;
    media?: Media | null;
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
