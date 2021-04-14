import { useCallback, useState } from 'react';

import { useApi } from '@panneau/data';

const useAuthCheck = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const check = useCallback(() => {
        setLoading(true);
        return api.auth
            .check()
            .then((response) => {
                setLoading(false);
                return response;
            })
            .catch((e) => {
                setLoading(false);
                throw e;
            });
    }, [api, setLoading]);
    return { check, loading };
};

export default useAuthCheck;
