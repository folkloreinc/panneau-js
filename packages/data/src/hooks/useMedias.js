import { useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';

import useItems from './useItems';

const useMedias = (query = null, page = null, count = null, opts) => {
    const api = useApi();
    const getItems = useCallback(
        (requestedPage = null) => api.medias.get(query, requestedPage, count),
        [api, query, count],
    );
    const { items, pageItems, ...request } = useItems({
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        ...opts,
    });
    // console.log('medias', items);
    return {
        medias: page !== null ? pageItems : items,
        allMedias: items,
        ...request,
    };
};

export default useMedias;
