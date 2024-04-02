import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaDestroy = () => {
    const [loading, setLoading] = useState(false);
    const api = useMediasApi();
    const destroy = useCallback(
        (id, data) => {
            setLoading(true);
            return api.delete(id, data).then((response) => {
                setLoading(false);
                return response;
            });
        },
        [api, setLoading],
    );
    return { destroy, loading };
};

export default useMediaDestroy;
