import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useResourceRestore = (resource, id = null) => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const restore = useCallback(
        (providedId) => {
            setLoading(true);
            return api.resources
                .restore(resource, providedId || id)
                .then((response) => {
                    setLoading(false);
                    return response;
                })
                .catch((e) => {
                    setLoading(false);
                    throw e;
                });
        },
        [api, resource, id, setLoading],
    );
    return { restore, loading };
};

export default useResourceRestore;
