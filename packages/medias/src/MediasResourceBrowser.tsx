/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import { useMemo } from 'react';

import { usePanneauResource } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';

import { MediasApi } from './MediasApiContext';
import MediasBrowserContainer from './MediasBrowserContainer';

interface MediasResourceBrowserProps {
    resource?: string | null;
    [key: string]: unknown;
}

function MediasResourceBrowser({
    resource: resourceId = 'medias',
    ...props
}: MediasResourceBrowserProps) {
    const resource = usePanneauResource(resourceId);
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
    return <MediasBrowserContainer api={mediasApi} {...props} />;
}

export default MediasResourceBrowser;
