import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaTrash = () => {
    const [trashing, setTrashing] = useState(false);
    const api = useMediasApi();
    const mediaTrash = useCallback(
        (id, data) => {
            setTrashing(true);
            return api.trash(id, data).then((response) => {
                setTrashing(false);
                return response;
            });
        },
        [api, setTrashing],
    );
    return { mediaTrash, trashing };
};

export default useMediaTrash;
