import type { Resource } from '@panneau/core';
import { usePanneauResource } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';

import { MediasApi } from './MediasApiContext';
import MediasBrowserContainer, { MediasBrowserContainerProps } from './MediasBrowserContainer';

export interface MediasResourceBrowserProps extends MediasBrowserContainerProps {
    resource?: Resource | string | null;
}

function MediasResourceBrowser({
    resource: resourceId = 'medias',
    ...props
}: MediasResourceBrowserProps) {
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
        <MediasBrowserContainer
            api={mediasApi}
            {...(filters !== null ? { filters } : null)}
            {...(fields !== null ? { fields } : null)}
            {...(columns !== null ? { columns } : null)}
            {...props}
        />
    );
}

export default MediasResourceBrowser;
