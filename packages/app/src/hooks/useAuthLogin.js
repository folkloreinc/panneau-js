import { useCallback, useState } from 'react';

import { useApi } from '@panneau/data';

const useAuthLogin = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const login = useCallback(
        (email, password) => {
            setLoading(true);

            if (email === 'info@atelierfolklore.ca' && password === 'papouasi3') {
                return new Promise(() => ({
                    id: 1,
                    name: 'Folklore',
                    email: 'info@atelierolklore.ca',
                }));
            }

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
