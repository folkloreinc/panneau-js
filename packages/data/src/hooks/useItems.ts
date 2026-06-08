import { getJSON } from '@folklore/fetch';
import { UseQueryOptions, UseQueryResult, keepPreviousData, useQuery } from '@tanstack/react-query';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import queryString from 'query-string';
import { useState } from 'react';

import { Item, Pagination } from '@panneau/core';

// The new, better version

export type UseItemsResponse<T> =
    | {
          data: T[];
          pagination: Pagination;
          meta?: Pagination;
      }
    | T[];

type UseItemsKey = [string, Record<string, unknown> | null, number | null, number | null];

type Query = {
    page?: number | null;
    count?: number | null;
    [key: string]: unknown;
};

export type UseItemsOptions<T> = Omit<
    UseQueryOptions<UseItemsResponse<T>, Error, UseItemsResponse<T>, UseItemsKey>,
    'queryKey' | 'queryFn'
> & {
    url?: string | null;
    getItems?:
        | ((
              query: Record<string, unknown> | null,
              page: number | null,
              count: number | null,
          ) => Promise<UseItemsResponse<T>>)
        | null;
    page?: number | null;
    count?: number | null;
    query?: Query | null;
    keepData?: boolean;
};

type UseItemsResult<T> = {
    items: T[];
    allItems: T[];
    pages: Record<string, UseItemsResponse<T>>;
    pagination: { page: number; lastPage: number; total: number } | null;
    loading: boolean;
    loaded: boolean;
    reload: () => void;
    updateItem: (item: T) => void;
} & UseQueryResult<UseItemsResponse<T>, Error>;

function useItems<T = Item>(
    scope: string,
    {
        url = null,
        getItems = null,
        page: initialPage = null,
        count: initialCount = null,
        query = null,
        keepData = true,
        ...queryConfig
    }: UseItemsOptions<T>,
): UseItemsResult<T> {
    const { page = initialPage, count = initialCount, ...queryWithoutPage } = query || {};
    const paginated = page !== null;

    const {
        data = null,
        refetch: reload,
        isLoading,
        isFetching,
        isRefetching,
        isFetched,
        ...otherProps
    } = useQuery<UseItemsResponse<T>, Error, UseItemsResponse<T>, UseItemsKey>({
        queryKey: [scope, queryWithoutPage, page, count],
        queryFn: ({
            queryKey: [, queryParam = null, pageParam = null, countParam = null] = [],
        }) => {
            return getItems !== null
                ? getItems(queryParam, pageParam, countParam)
                : getJSON(
                      `${url}?${queryString.stringify(
                          {
                              ...(isObject(queryParam) ? queryParam : {}),
                              ...(pageParam !== null ? { page: pageParam } : null),
                              ...(countParam !== null ? { count: countParam } : null),
                          },
                          { arrayFormat: 'bracket' },
                      )}`,
                  );
        },
        refetchOnMount: 'always',
        ...(keepData ? { placeholderData: keepPreviousData } : null),
        // ...(providedItems !== null ? { initialData: providedItems } : null), TODO: beware of this one
        ...queryConfig,
    });

    const {
        data: items = [],
        pagination = null,
        meta = null,
    } = isArray(data) ? { data } : data || {};
    const {
        page: currentPage = null,
        last_page: lastPage = 0,
        total = null,
    } = pagination || meta || {};

    // Keep a list of updated items
    const [updatedItems, setUpdatedItems] = useState([]);
    const updateItem = (item) => {
        const { id: itemId = null } = item || {};
        if (itemId !== null) {
            setUpdatedItems([
                ...(updatedItems || []).filter(({ id = null } = {}) => id !== itemId),
                item,
            ]);
        }
    };

    const replaceUpdatedItems = (currentItems) => {
        if (currentItems === null || updatedItems === null || updatedItems.length === 0) {
            return currentItems;
        }
        return (currentItems || []).map((item) => {
            const { id: itemId = null } = item || {};
            const updated =
                (updatedItems || []).find(({ id = null } = {}) => id === itemId) || null;
            if (updated !== null) {
                return updated;
            }
            return item;
        }, []);
    };

    const finalItems = replaceUpdatedItems(items);

    // Keep a list of pages, useEffect wont work here because delayed
    const [pages, setPages] = useState({});
    if (isFetched && page !== null && data !== null && typeof pages[page] === 'undefined') {
        setPages({
            ...pages,
            [page]: data,
        });
    }

    const allItems = pages
        ? replaceUpdatedItems(Object.keys(pages).flatMap((k) => pages[k]?.data))
        : finalItems;

    const finalLoading = isLoading || isFetching || isRefetching;

    return {
        ...otherProps,
        isLoading,
        isFetching,
        isRefetching,
        isFetched,
        items: finalItems,
        pages,
        allItems,
        loading: finalLoading,
        loaded: isFetched,
        reload,
        updateItem,
        pagination: paginated ? { page: currentPage, lastPage, total } : null,
    };
}

export default useItems;
