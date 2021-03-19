import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useAuthRegister = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const register = useCallback(
        (data) => {
            setLoading(true);
            return api.auth
                .register(data)
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
    return { register, loading };
};

export default useAuthRegister;
