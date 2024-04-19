import { useCallback } from 'react';

import { useItemsStore } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

const useMedias = (query = null, page = null, count = null, opts = {}) => {
    const api = useMediasApi();

    const getItems = useCallback(
        (requestedPage = null) => api.get(query, requestedPage, count),
        [api, query, count],
    );

    const { items, ...props } = useItemsStore('medias', {
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        count,
        query,
        ...opts,
    });

    return {
        items,
        ...props,
    };
};

export default useMedias;
