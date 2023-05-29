import { useCallback, useEffect, useMemo, useState } from 'react';

const useResourceQuery = (initialValues = null, paginated = true) => {
    const initialQuery = useMemo(
        () => (paginated ? { page: 1, count: 10, ...initialValues } : initialValues || null),
        [paginated, initialValues],
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
            setQuery(finalQuery);
        },
        [query, setQuery],
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
