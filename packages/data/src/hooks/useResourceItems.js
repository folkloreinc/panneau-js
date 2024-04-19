import { useCallback, useRef } from 'react';

import { useApi } from '../contexts/ApiContext';
import useItemsStore from './useItemsStore';

const useResourceItems = (resource, query = null, page = null, count = null, opts = null) => {
    const api = useApi();

    const { id = null } = resource || {};
    const lastResourceRef = useRef(id);
    const resourceChanging = lastResourceRef.current !== id;

    const getPage = useCallback(
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

    const getItems = useCallback(
        () =>
            api.resources
                .get(resource, query, null, null)
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

    const { items, ...request } = useItemsStore(id, {
        getPage: page !== null ? getPage : null,
        getItems: page === null ? getItems : null,
        query,
        page,
        count,
        ...opts,
    });

    return {
        items: resourceChanging ? null : items,
        ...request,
    };
};

export default useResourceItems;
