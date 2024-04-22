import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaDelete = () => {
    const [deleting, setDeleting] = useState(false);
    const api = useMediasApi();
    const mediaDelete = useCallback(
        (id, data) => {
            setDeleting(true);
            return api.delete(id, data).then((response) => {
                setDeleting(false);
                return response;
            });
        },
        [api, setDeleting],
    );
    return { mediaDelete, deleting };
};

export default useMediaDelete;
