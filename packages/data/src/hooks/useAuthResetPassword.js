import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useAuthResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const reset = useCallback(
        (data) => {
            setLoading(true);
            return api.auth
                .resetPassword(data)
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
    return { reset, loading };
};

export default useAuthResetPassword;
