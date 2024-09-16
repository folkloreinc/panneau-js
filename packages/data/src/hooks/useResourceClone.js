import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useResourceClone = (resource, id = null) => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const destroy = useCallback(
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
    return { destroy, loading };
};

export default useResourceClone;
