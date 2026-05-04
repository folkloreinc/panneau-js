import { useQuery } from '@tanstack/react-query';

import { type Item, type Resource } from '@panneau/core';

import { useApi } from '../contexts/ApiContext';

function useResourceItem<T = Item>(resource: Resource, id, opts = null) {
    const api = useApi();
    const { id: resourceId } = resource;
    const { data = null, ...request } = useQuery<T>({
        queryKey: [resourceId, id],
        queryFn: () => api.resources.find(resource, id),
        ...opts,
    });
    return {
        item: data,
        ...request,
    };
}

export default useResourceItem;
