import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';

import { Resource, type ResourceItem } from '@panneau/core';
import { usePanneauResource, useResource } from '@panneau/core/contexts';

import { useApi } from '../contexts/ApiContext';
import useItems, { UseItemsOptions } from './useItems';

function useResourceItems();
function useResourceItems(resource: Resource | string);
function useResourceItems(resource: Resource | string, query: Record<string, unknown> | null);
function useResourceItems(
    resource: Resource | string,
    query: Record<string, unknown> | null,
    page: number | null,
);
function useResourceItems(
    resource: Resource | string,
    query: Record<string, unknown> | null,
    page: number | null,
    count: number | null,
);
function useResourceItems<T = ResourceItem>(
    resource: Resource | string,
    query: Record<string, unknown> | null,
    page: number | null,
    count: number | null,
    opts: UseItemsOptions<T>,
);
function useResourceItems(query: Record<string, unknown> | null);
function useResourceItems(query: Record<string, unknown> | null, page: number | null);
function useResourceItems(
    query: Record<string, unknown> | null,
    page: number | null,
    count: number | null,
);
function useResourceItems<T = ResourceItem>(
    query: Record<string, unknown> | null,
    page: number | null,
    count: number | null,
    opts: UseItemsOptions<T>,
);

function useResourceItems<T = ResourceItem>(
    resource: Resource | string | Record<string, unknown> | null = null,
    query: Record<string, unknown> | number | null = null,
    page: number | null = null,
    count: number | null | UseItemsOptions<T> = null,
    opts: UseItemsOptions<T> = null,
) {
    const api = useApi();
    const providedResource = usePanneauResource(
        isString(resource) || isObject(resource) ? (resource as Resource | string) : null,
    );
    const firstIsResource = (isString(resource) || isObject(resource)) && providedResource !== null;
    const contextResource = useResource();
    const finalResource = providedResource || contextResource;
    const { id: resourceId = null } = finalResource || {};
    const finalQuery = (firstIsResource ? query : resource) as Record<string, unknown> | null;
    const finalPage = (firstIsResource ? page : query) as number | null;
    const finalCount = (firstIsResource ? count : page) as number | null;
    const finalOpts = (firstIsResource ? opts : count) as UseItemsOptions<T>;

    const getItems = (query, requestedPage = null, count = null) =>
        api.resources.get<T>(finalResource, query, requestedPage, count);

    return useItems<T>(resourceId, {
        getItems,
        query: finalQuery,
        page: finalPage,
        count: finalCount,
        ...finalOpts,
    });
}

export default useResourceItems;
