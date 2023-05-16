import { useCallback, useRef } from 'react';

import { useApi } from '../contexts/ApiContext';
import useItems from './useItems';

const useResourceItems = (resource, query = null, page = null, count = null, opts = null) => {
    const api = useApi();

    const { id = null } = resource || {};
    const lastResourceRef = useRef(id);
    const resourceChanging = lastResourceRef.current !== id;

    const getItems = useCallback(
        (requestedPage = null) =>
            api.resources
                .get(resource, query, requestedPage, count)
                .then((response) => {
                    const { id: resourceId } = resource || {};
                    lastResourceRef.current = resourceId;
                    return response;
                })
                .catch((err) => {
                    const { id: resourceId } = resource || {};
                    lastResourceRef.current = resourceId;
                    throw err;
                }),
        [api, resource, query, count],
    );

    const { items, pageItems, ...request } = useItems({
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        ...opts,
    });

    const finalItems = page !== null ? pageItems : items;

    return {
        items: resourceChanging ? null : finalItems,
        allItems: items,
        ...request,
    };
};

export default useResourceItems;
