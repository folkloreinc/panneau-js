import { useCallback, useRef } from 'react';

import { Item } from '@panneau/core';

import { useApi } from '../contexts/ApiContext';
import useItems from './useItems';

function useResourceItems<T = Item>(
    resource,
    query = null,
    page = null,
    count = null,
    opts = null,
) {
    const api = useApi();

    const { id = null } = resource || {};
    const lastResourceRef = useRef(id);
    const resourceChanging = lastResourceRef.current !== id;

    const getItems = (query, requestedPage = null, count = null) =>
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
            });

    const { items, ...request } = useItems<T>(id, {
        getItems,
        query,
        page,
        count,
        ...opts,
    });

    return {
        items: resourceChanging ? null : items,
        ...request,
    };
}

export default useResourceItems;
