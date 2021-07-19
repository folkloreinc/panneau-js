import { useCallback, useState } from 'react';

import { useApi } from '@panneau/data';

const useAuthLogout = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const logout = useCallback(() => {
        setLoading(true);
        console.log('yeaah', api);
        return api.auth
            .logout()
            .then((response) => {
                console.log('logout success');
                setLoading(false);
                return response;
            })
            .catch((err) => {
                const { status } = err || {};
                // 204 is logout success from laravel - no content
                if (parseInt(status, 10) === 204) {
                    setLoading(false);
                    return null;
                } 
                setLoading(false);
                throw err;
            });
    }, [api, setLoading]);

    return { logout, loading };
};

export default useAuthLogout;
