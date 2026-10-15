import type { Media } from '@panneau/core';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import MediasBrowser, { MediasBrowserProps } from './MediasBrowser';
import { useMediasBrowserContext } from './MediasBrowserContext';

export interface MediasBrowserContainerProps extends MediasBrowserProps {
    api?: MediasApi | null;
    media?: Media | null;
}

function MediasBrowserContainer({
    api = null,
    media = null,
    ...props
}: MediasBrowserContainerProps) {
    const contextProps = useMediasBrowserContext();
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasBrowser {...contextProps} {...props} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

export default MediasBrowserContainer;
