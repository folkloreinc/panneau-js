import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useResourceCreate = (resource) => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const store = useCallback(
        (data) => {
            setLoading(true);
            return api.resources
                .store(resource, data)
                .then((response) => {
                    setLoading(false);
                    return response;
                })
                .catch((e) => {
                    setLoading(false);
                    throw e;
                });
        },
        [api, resource, setLoading],
    );
    return { store, loading };
};

export default useResourceCreate;
