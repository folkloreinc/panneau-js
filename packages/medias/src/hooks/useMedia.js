import { useCallback } from 'react';

import { useData } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

const useMedia = (id, opts) => {
    const api = useMediasApi();
    const loader = useCallback(() => api.find(id), [api, id]);
    const { data, ...request } = useData(loader, opts);
    return {
        story: data,
        ...request,
    };
};

export default useMedia;
