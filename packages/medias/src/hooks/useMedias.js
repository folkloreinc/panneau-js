import { useCallback, useMemo } from 'react';

import { useItemsStore } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

const useMedias = (query = null, page = null, count = null, opts = {}) => {
    const api = useMediasApi();

    const trashed = useMemo(() => {
        const { trashed: trashedOpt = false } = opts || {};
        return trashedOpt;
    }, [opts]);

    const finalQuery = useMemo(() => ({ ...query, trashed }), [query, trashed]);

    const getItems = useCallback(
        (requestedPage = null) =>
            trashed
                ? api.getTrashed(query, requestedPage, count)
                : api.get(query, requestedPage, count),
        [api, query, count, trashed],
    );

    const { items, ...props } = useItemsStore('medias', {
        getPage: page !== null ? getItems : null,
        getItems: page === null ? getItems : null,
        page,
        count,
        query: finalQuery,
        ...opts,
    });

    return {
        items,
        ...props,
    };
};

export default useMedias;
