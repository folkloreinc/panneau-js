import { getJSON } from '@folklore/fetch';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import queryString from 'query-string';
import { useCallback, useMemo, useRef, useState } from 'react';

const useItemsStore = (
    store,
    {
        url = null,
        getPage = null,
        getItems = null,
        getPageFromResponse = null,
        getItemsFromResponse = null,
        page: initialPage = null,
        count: initialCount = null,
        query = null,
        onQueryChange = null,
        queryConfig = null,
        keepData = true,
    },
) => {
    const { page = initialPage, count = initialCount, ...queryWithoutPage } = query || {};
    const paginated = page !== null;
    const queryKey = useMemo(
        () => (paginated ? [store, page || 1, count || 12, queryWithoutPage] : [store, query]),
        [paginated, store, page, count, query, queryWithoutPage, getPage, getItems],
    );

    const {
        data = null,
        refetch: reload,
        isLoading,
        isFetching,
        isRefetching,
        isFetched,
        ...otherProps
    } = useQuery({
        queryKey,
        queryFn: ({ queryKey: key = null }) => {
            if (paginated && getPage !== null) {
                const [, p = null, c = null, q = null] = key;
                return getPage(p, c, q);
            }
            if (!paginated && getItems !== null) {
                const [, q = null] = key;
                return getItems(q);
            }
            const [, q = null] = key;
            return getJSON(
                `${url}${
                    !isEmpty(q) ? `?${queryString.stringify(q, { arrayFormat: 'bracket' })}` : ''
                }`,
            );
        },
        ...(keepData ? { placeholderData: keepPreviousData } : null),
        // ...(providedItems !== null ? { initialData: providedItems } : null), TODO: beware of this one
        ...queryConfig,
    });

    const { data: items = [], pagination = null, metadata = null } = data || {};
    const {
        page: currentPage = null,
        last_page: lastPage = 0,
        total = null,
    } = pagination || metadata || {};

    const loadNextPage = useCallback(() => {
        if (onQueryChange !== null && paginated && page !== null && page < lastPage) {
            onQueryChange({ ...query, page: page + 1 });
        }
    }, [paginated, pagination, page]);

    const loadPage = useCallback(
        (newPage) => {
            if (onQueryChange !== null && newPage !== null) {
                onQueryChange({ ...query, page: newPage });
            }
        },
        [query, onQueryChange],
    );

    // Keep a list of updated items
    const [updatedItems, setUpdatedItems] = useState([]);
    const updateItem = useCallback(
        (item) => {
            const { id: itemId = null } = item || {};
            if (itemId !== null) {
                setUpdatedItems([
                    ...(items || []).filter(({ id = null } = {}) => id !== itemId),
                    item,
                ]);
            }
        },
        [items, updatedItems, setUpdatedItems],
    );
    const replaceUpdatedItems = useCallback(
        (currentItems) => {
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
        },
        [updatedItems],
    );

    const partialItems = useMemo(() => {
        if (data === null) {
            return data;
        }
        if (paginated) {
            if (getPageFromResponse !== null) {
                return getPageFromResponse(items);
            }
            return items;
        }
        if (getItemsFromResponse !== null) {
            return getItemsFromResponse(data);
        }
        return data;
    }, [items, data, paginated, getPageFromResponse, getItemsFromResponse, updatedItems]);

    const finalItems = replaceUpdatedItems(partialItems);

    // Keep a list of pages, useEffect wont work here because delayed
    const pages = useRef(null);
    if (isFetched && page !== null && data !== null) {
        pages.current = {
            ...pages.current,
            [page]: data,
        };
    }

    const allItems =
        pages.current !== null
            ? replaceUpdatedItems(Object.keys(pages.current).flatMap((k) => pages.current[k]?.data))
            : finalItems;

    const finalLoading = isLoading || isFetching || isRefetching;

    return {
        ...otherProps,
        isLoading,
        isFetching,
        isRefetching,
        isFetched,
        items: finalItems,
        pages: pages.current,
        allItems,
        loading: finalLoading,
        loaded: isFetched,
        reload,
        loadPage,
        loadNextPage,
        updateItem,
        pagination: paginated ? { page: currentPage, lastPage, total } : null,
    };
};

export default useItemsStore;
