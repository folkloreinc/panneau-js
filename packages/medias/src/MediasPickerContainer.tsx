import type { Media } from '@panneau/core';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import MediasPicker, { MediasPickerProps } from './MediasPicker';

export interface MediasPickerContainerProps extends MediasPickerProps {
    api?: MediasApi | null;
    media?: Media | null;
}

function MediasPickerContainer({ api = null, media = null, ...props }: MediasPickerContainerProps) {
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasPicker {...props} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

export default MediasPickerContainer;
