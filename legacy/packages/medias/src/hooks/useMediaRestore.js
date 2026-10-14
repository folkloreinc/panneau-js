import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

function useMediaRestore() {
    const [restoring, setRestoring] = useState(false);
    const api = useMediasApi();
    const mediaRestore = useCallback(
        (id, data) => {
            setRestoring(true);
            return api.restore(id, data).finally(() => {
                setRestoring(false);
            });
        },
        [api, setRestoring],
    );
    return { mediaRestore, restoring };
}

export default useMediaRestore;
