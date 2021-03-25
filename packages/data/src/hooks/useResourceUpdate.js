import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useResourceUpdate = (resource, id) => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const update = useCallback(
        (data) => {
            setLoading(true);
            return api.resources
                .update(resource, id, data)
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
    return { update, loading };
};

export default useResourceUpdate;
