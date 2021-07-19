import { useCallback, useState } from 'react';

import { useApi } from '@panneau/data';

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
            .catch((err) => {
                const { status } = err || {};
                setLoading(false);
                // 204 is logout success from laravel - no content
                if (parseInt(status, 10) === 204) {
                    return null;
                } 
                throw err;
            });
    }, [api, setLoading]);

    return { logout, loading };
};

export default useAuthLogout;
