import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

function useMediaCreate() {
    const [creating, setCreating] = useState(false);
    const api = useMediasApi();
    const create = useCallback(
        (data) => {
            setCreating(true);
            return api.create(data).finally(() => {
                setCreating(false);
            });
        },
        [api, setCreating],
    );
    return { create, creating };
}

export default useMediaCreate;
