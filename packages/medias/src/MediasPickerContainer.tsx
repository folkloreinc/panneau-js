import type { Media } from '@panneau/core';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import { useMediasBrowserContext } from './MediasBrowserContext';
import MediasPicker, { MediasPickerProps } from './MediasPicker';

export interface MediasPickerContainerProps extends MediasPickerProps {
    api?: MediasApi | null;
    media?: Media | null;
}

function MediasPickerContainer({ api = null, media = null, ...props }: MediasPickerContainerProps) {
    const contextProps = useMediasBrowserContext();
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasPicker {...contextProps} {...props} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

export default MediasPickerContainer;
