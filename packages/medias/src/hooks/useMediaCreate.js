import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaCreate = () => {
    const [creating, setCreating] = useState(false);
    const api = useMediasApi();
    const create = useCallback(
        (data) => {
            setCreating(true);
            return api.create(data).then((response) => {
                setCreating(false);
                return response;
            });
        },
        [api, setCreating],
    );
    return { create, creating };
};

export default useMediaCreate;
