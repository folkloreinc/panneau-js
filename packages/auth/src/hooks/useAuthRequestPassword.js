import { useCallback, useState } from 'react';

import { useApi } from '@panneau/data';

const useAuthRequestPassword = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const request = useCallback(
        (email) => {
            setLoading(true);
            return api.auth
                .requestPassword(email)
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
    return { request, loading };
};

export default useAuthRequestPassword;
