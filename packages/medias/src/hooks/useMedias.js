import { useCallback } from 'react';

import { useItems } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

const useMedias = (query = null, page = null, count = null, opts = {}) => {
    const api = useMediasApi();

    const getItems = useCallback(
        (requestedPage = null) => api.get(query, requestedPage, count),
        [api, query, count],
    );

    const { items, pageItems, ...request } = useItems({
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        ...opts,
    });

    return {
        medias: page !== null ? pageItems : items,
        allMedias: items,
        ...request,
    };
};

export default useMedias;
