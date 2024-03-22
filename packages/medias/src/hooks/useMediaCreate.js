import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaCreate = () => {
    const [loading, setLoading] = useState(false);
    const api = useMediasApi();
    const create = useCallback(
        (data) => {
            setLoading(true);
            return api.create(data).then((response) => {
                setLoading(false);
                return response;
            });
        },
        [api, setLoading],
    );
    return { create, loading };
};

export default useMediaCreate;
