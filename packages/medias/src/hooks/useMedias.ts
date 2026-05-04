import { useItems } from '@panneau/data';

import { useMediasApi } from '../MediasApiContext';

interface UseMediasOpts {
    trashed?: boolean;
    [key: string]: unknown;
}

function useMedias(query = null, page = null, count = null, opts: UseMediasOpts = {}) {
    const api = useMediasApi();
    const { trashed = false, ...queryOpts } = opts || {};
    const finalQuery = { ...query, trashed };
    const getItems = (requestedQuery, requestedPage = null, requestedCount) =>
        trashed
            ? api.getTrashed(requestedQuery, requestedPage, requestedCount)
            : api.get(requestedQuery, requestedPage, requestedCount);

    const { items, ...props } = useItems('medias', {
        getItems: page === null ? getItems : null,
        page,
        count,
        query: finalQuery,
        ...queryOpts,
    });

    return {
        items,
        ...props,
    };
}

export default useMedias;
