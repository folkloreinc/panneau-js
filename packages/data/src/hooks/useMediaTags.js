import { useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';

import useItems from './useItems';

const useMediaTags = (query = null, count = 5, opts) => {
    const api = useApi();
    const getItems = useCallback(() => api.medias.getTags(query, count), [api, query, count]);
    const { items, pageItems, ...request } = useItems({
        getItems,
        ...opts,
    });
    return {
        tags: items,
        ...request,
    };
};

export default useMediaTags;
