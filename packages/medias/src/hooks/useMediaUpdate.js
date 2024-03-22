import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaUpdate = () => {
    const [loading, setLoading] = useState(false);
    const api = useMediasApi();
    const update = useCallback(
        (id, data) => {
            setLoading(true);
            return api.update(id, data).then((response) => {
                setLoading(false);
                return response;
            });
        },
        [api, setLoading],
    );
    return { update, loading };
};

export default useMediaUpdate;
