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

function useQuery(
    initialBaseQuery: QueryParams | null = null,
    paginated = true,
): UseQueryReturn {
    const initialQuery = useMemo(
        () =>
            paginated
                ? { page: 1, count: 10, ...(initialBaseQuery || {}) }
                : initialBaseQuery || null,
        [paginated, initialBaseQuery],
    );

    const [query, setQuery] = useState<QueryParams | null>(initialQuery);
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery, setQuery]);

    const onPageChange = useCallback(
        (newPage: number) => {
            setQuery({ ...(query || {}), page: newPage || 1 });
        },
        [query, setQuery],
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
        [query, setQuery, initialQuery],
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
