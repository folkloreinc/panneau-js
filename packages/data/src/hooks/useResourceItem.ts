import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';
import { isObject } from 'lodash';

import { type ResourceItem, type Resource } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

type UseResourceItem<T> = UseQueryResult<T> & {
    item: T | null;
};

function useResourceItem<T = ResourceItem>(id: string | null): UseResourceItem<T>;
function useResourceItem<T = ResourceItem>(id: string | null, opts): UseResourceItem<T>;
function useResourceItem<T = ResourceItem>(
    resource: Resource | string | null,
    id: string | null,
): UseResourceItem<T>;
function useResourceItem<T = ResourceItem>(
    resource: Resource | string | null,
    id: string | null,
    opts,
): UseResourceItem<T>;

function useResourceItem<T = ResourceItem>(
    resource: Resource | string | null,
    id: string | null | UseQueryOptions<T> = null,
    opts: UseQueryOptions<T> = null,
): UseResourceItem<T> {
    const api = useApi();
    const providedResource = usePanneauResource(id !== null && !isObject(id) ? resource : null);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = providedResource !== null ? id : resource;
    const { id: resourceId } = finalResource;
    const { data = null, ...request } = useQuery<T>({
        queryKey: [resourceId, finalId],
        queryFn: () => api.resources.find(finalResource, finalId),
        ...opts,
    });
    return {
        item: data,
        ...request,
    };
}

export default useResourceItem;
