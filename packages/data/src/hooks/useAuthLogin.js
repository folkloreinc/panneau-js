import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useAuthLogin = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const login = useCallback(
        (email, password) => {
            setLoading(true);
            return api.auth
                .login(email, password)
                .then((response) => {
                    setLoading(false);
                    return response;
                })
                .catch((e) => {
                    setLoading(false);
                    throw e;
                });
        },
        [api, setLoading],
    );
    return { login, loading };
};

export default useAuthLogin;
