import isEqual from 'lodash-es/isEqual';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QueryParams {
    page?: number;
    count?: number;
    [key: string]: unknown;
}

interface UseQueryReturn {
    query: QueryParams | null;
    onPageChange: (newPage: number) => void;
    onQueryChange: (newQuery: QueryParams | null) => void;
    onQueryReset: () => void;
}

function useQuery(initialBaseQuery: QueryParams | null = null, paginated = true): UseQueryReturn {
    // Keep a stable reference to the base query so a new object with the same
    // value (ex: an inline object literal) doesn't reset the query on every render.
    // Uses the "store information from previous renders" pattern: when the content
    // changes, the state is updated during render and React re-renders immediately.
    const [stableBaseQuery, setStableBaseQuery] = useState<QueryParams | null>(initialBaseQuery);
    if (!isEqual(stableBaseQuery, initialBaseQuery)) {
        setStableBaseQuery(initialBaseQuery);
    }

    const initialQuery = useMemo(
        () =>
            paginated
                ? { page: 1, count: 10, ...(stableBaseQuery || {}) }
                : stableBaseQuery || null,
        [paginated, stableBaseQuery],
    );

    const [query, setQuery] = useState<QueryParams | null>(initialQuery);
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery, setQuery]);

    const onPageChange = useCallback(
        (newPage: number) => {
            if (newPage !== null) {
                setQuery((prev) => ({ ...(prev || {}), page: newPage || 1 }));
            }
        },
        [setQuery],
    );

    const onQueryChange = useCallback(
        (newQuery: QueryParams | null) => {
            const finalQuery =
                newQuery !== null
                    ? Object.keys(newQuery).reduce<QueryParams | null>((currentQuery, key) => {
                          const val = newQuery[key];
                          return val !== null
                              ? {
                                    ...(currentQuery || {}),
                                    [key]: val,
                                }
                              : currentQuery;
                      }, null)
                    : null;
            setQuery({ ...(initialQuery || {}), ...(finalQuery || {}) });
        },
        [setQuery, initialQuery],
    );

    const onQueryReset = useCallback(() => {
        setQuery(initialQuery);
    }, [initialQuery, setQuery]);

    return {
        query,
        onPageChange,
        onQueryChange,
        onQueryReset,
    };
}

export default useQuery;
