import { getJSON } from '@folklore/fetch';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const useItems = ({
    store,
    url,
    paginated: initialPaginated = false,
    query: initialQuery = null,
    onQueryChange,
    queryConfig = null,
    keepData = true,
    ...oldProps
}) => {
    // Legacy
    const {
        getPage = null,
        getItems = null,
        page: oldPage = null,
        count: oldCount = null,
        items: providedItems = null,
        pages: initialPages = null,
        getPageFromResponse = ({
            pagination: {
                page: currentPage = null,
                last_page: lastPage = null,
                total = null,
                per_page: perPage = null,
            },
            data: items = null,
        } = {}) => ({
            page: parseInt(currentPage, 10),
            lastPage: parseInt(lastPage, 10),
            total: parseInt(total, 10),
            count: parseInt(perPage, 10),
            items,
        }),
        getItemsFromResponse = (data) => data,
        onItemsLoaded = null,
        onPageLoaded = null,
        onLoaded = null,
        onError = null,
    } = oldProps || {};

    const paginated = useMemo(
        () => getPage !== null || initialPages !== null || initialPaginated,
        [getPage, initialPages, initialPaginated],
    );

    const query = useMemo(() => {
        // Backwards compatible
        if (oldPage !== null || oldCount !== null) {
            return { page: oldPage, count: oldCount, ...initialQuery };
        }
        return initialQuery;
    }, [initialQuery]);

    const { page = null, count = null, ...queryWithoutPageAndCount } = query || {};
    const queryKey = useMemo(
        () =>
            paginated && getPage !== null
                ? [store, page, count || 10, queryWithoutPageAndCount]
                : [store, query],
        [paginated, page, count, queryWithoutPageAndCount],
    );

    const {
        data = null,
        refetch: reload,
        isLoading,
        isFetching,
        isRefetching,
        isFetched,
        status = null,
        error = null,
        ...otherProps
    } = useQuery({
        queryKey,
        queryFn: ({ queryKey: key }) => {
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
        // ...(providedItems !== null ? { initialData: providedItems } : null),
        ...queryConfig,
    });

    const { data: items = [], pagination = null, meta = null } = data || {};
    const {
        page: currentPage = null,
        last_page: lastPage = null,
        total = null,
    } = pagination || meta || {};

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
                    ...(updatedItems || []).filter(({ id = null } = {}) => id !== itemId),
                    item,
                ]);
            }
        },
        [updatedItems, setUpdatedItems],
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

    // Pseudo-events for compatibility
    useEffect(() => {
        if (status === 'success') {
            if (onPageLoaded !== null && paginated) {
                onItemsLoaded(data);
            }
            if (onItemsLoaded !== null && !paginated) {
                onItemsLoaded(data);
            }
            if (onLoaded !== null) {
                onLoaded(data);
            }
        }
        if (status === 'error' && onError !== null) {
            onError(error);
        }
        if (status === 'pending') {
            //
        }
    }, [status]);

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
            : null;

    const finalLoading = isLoading || isFetching || isRefetching;

    return {
        ...otherProps,
        items: finalItems,
        allItems,
        pages: pages.current,
        pageItems: paginated ? finalItems : null,
        pagination: paginated ? { page: currentPage, lastPage, total } : null,
        total,
        lastPage,
        loaded: isFetched,
        allLoaded:
            (paginated &&
                pages.current !== null &&
                Object.keys(pages.current).length === lastPage) ||
            (!paginated && isFetched), // very basic stuff, TODO
        loading: finalLoading,
        loadNextPage,
        loadPage,
        reloadPage: reload,
        reload,
        reset: reload,
        updateItem,
        status,
        error,
    };
};

export default useItems;
