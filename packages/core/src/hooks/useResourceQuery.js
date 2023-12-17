import { useCallback, useEffect, useMemo, useState } from 'react';

const useResourceQuery = (
    initialBaseQuery = null,
    paginated = true,
    { forceInitialQuery = false } = {},
) => {
    const initialQuery = useMemo(
        () => (paginated ? { page: 1, count: 10, ...initialBaseQuery } : initialBaseQuery || null),
        [paginated, initialBaseQuery],
    );

    const [query, setQuery] = useState(initialQuery);
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery, setQuery]);

    const onPageChange = useCallback(
        (newPage) => {
            setQuery({ ...query, page: newPage || 1 });
        },
        [query, setQuery],
    );

    const onQueryChange = useCallback(
        (newQuery) => {
            const finalQuery =
                newQuery !== null
                    ? Object.keys(newQuery).reduce((currentQuery, key) => {
                          const val = newQuery[key];
                          return val !== null
                              ? {
                                    ...currentQuery,
                                    [key]: val,
                                }
                              : currentQuery;
                      }, null)
                    : null;

            if (forceInitialQuery) {
                setQuery({ ...(initialBaseQuery || null), ...(finalQuery || null) });
            } else {
                setQuery(finalQuery);
            }
        },
        [query, setQuery, initialBaseQuery, forceInitialQuery],
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
};

export default useResourceQuery;
