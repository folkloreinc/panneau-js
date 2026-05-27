import { type Resource } from '@panneau/core';
import { usePanneauResource } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';

import { MediasApi } from './MediasApiContext';
import MediasPickerContainer, { MediasPickerContainerProps } from './MediasPickerContainer';

export interface MediasResourcePickerProps extends MediasPickerContainerProps {
    resource?: Resource | string | null;
    [key: string]: unknown;
}

function MediasResourcePicker({
    resource: resourceId = 'medias',
    ...props
}: MediasResourcePickerProps) {
    const resource = usePanneauResource(resourceId);
    const { index = null, fields = null } = resource || {};
    const { filters = null, columns = null } = index || {};
    const api = useApi();
    const mediasApi: MediasApi = {
        get: (...args) => api.resources.get(resource, ...args),
        getTrashed: (...args) => api.resources.getTrashed(resource, ...args),
        find: (...args) => api.resources.find(resource, ...args),
        create: (...args) => api.resources.store(resource, ...args),
        update: (...args) => api.resources.update(resource, ...args),
        trash: (...args) => api.resources.trash(resource, ...args),
        delete: (...args) => api.resources.destroy(resource, ...args),
    };

    return (
        <MediasPickerContainer
            api={mediasApi}
            {...(filters !== null ? { filters } : null)}
            {...(fields !== null ? { fields } : null)}
            {...(columns !== null ? { columns } : null)}
            {...props}
        />
    );
}

export default MediasResourcePicker;
