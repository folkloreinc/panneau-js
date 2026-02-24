import type { Media } from '@panneau/core/types';

import { MediaProvider } from './MediaContext';
import type { MediasApi } from './MediasApiContext';
import { MediasApiProvider } from './MediasApiContext';
import MediasPicker from './MediasPicker';

interface MediasPickerContainerProps {
    api?: MediasApi | null;
    media?: Media | null;
    onChange?: ((...args: unknown[]) => void) | null;
    [key: string]: unknown;
}

function MediasPickerContainer({
    api = null,
    media = null,
    onChange = null,
    ...props
}: MediasPickerContainerProps) {
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasPicker {...props} onChange={onChange} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

export default MediasPickerContainer;
