import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import isObject from 'lodash-es/isObject';

import { type Resource, type ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';

function useResourceItem(id: string | null);
function useResourceItem(id: string | null, opts);
function useResourceItem(resource: Resource | string | null, id: string | null);
function useResourceItem(resource: Resource | string | null, id: string | null, opts);

function useResourceItem<T = ResourceItem>(
    resource: Resource | string | null,
    id: string | null | UseQueryOptions<T> = null,
    opts: UseQueryOptions<T> = null,
) {
    const api = useApi();
    const providedResource = usePanneauResource(id !== null && !isObject(id) ? resource : null);
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const finalId = providedResource !== null ? (id as string) : (resource as string);
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
