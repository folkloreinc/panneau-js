import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useAuthLogout = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const logout = useCallback(() => {
        setLoading(true);
        return api.auth
            .logout()
            .then((response) => {
                setLoading(false);
                return response;
            })
            .catch((e) => {
                setLoading(false);
                throw e;
            });
    }, [api, setLoading]);
    return { logout, loading };
};

export default useAuthLogout;
