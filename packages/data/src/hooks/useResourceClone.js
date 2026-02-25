import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

function useResourceClone(resource, id = null) {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const clone = useCallback(
        (providedId) => {
            setLoading(true);
            return api.resources
                .clone(resource, providedId || id)
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
    return { clone, loading };
}

export default useResourceClone;
