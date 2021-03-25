import { useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';

import useItems from './useItems';

const useResourceItems = (resource, query = null, page = null, count = null, opts) => {
    const api = useApi();
    const getItems = useCallback(
        (requestedPage = null) => api.resources.get(resource, query, requestedPage, count),
        [api, resource, query, count],
    );
    const { items, pageItems, ...request } = useItems({
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        ...opts,
    });
    return {
        items: page !== null ? pageItems : items,
        allItems: items,
        ...request,
    };
};

export default useResourceItems;
