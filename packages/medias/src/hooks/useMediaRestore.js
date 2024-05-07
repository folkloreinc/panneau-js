import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaRestore = () => {
    const [restoring, setRestoring] = useState(false);
    const api = useMediasApi();
    const mediaRestore = useCallback(
        (id, data) => {
            setRestoring(true);
            return api.restore(id, data).then((response) => {
                setRestoring(false);
                return response;
            });
        },
        [api, setRestoring],
    );
    return { mediaRestore, restoring };
};

export default useMediaRestore;
