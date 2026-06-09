import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

function useMediaDestroy() {
    const [destroying, setDestroying] = useState(false);
    const api = useMediasApi();
    const mediaDestroy = useCallback(
        (id, data) => {
            setDestroying(true);
            return api.destroy(id, data).then((response) => {
                setDestroying(false);
                return response;
            });
        },
        [api, setDestroying],
    );
    return { mediaDestroy, destroying };
}

export default useMediaDestroy;
