import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useMediaCreate = () => {
    const [creating, setCreating] = useState(false);
    const api = useApi();
    const create = useCallback(
        data => {
            setCreating(true);
            return api.medias.create(data).then(response => {
                setCreating(false);
                return response;
            });
        },
        [api, setCreating],
    );
    return { create, creating };
}

export default useMediaCreate;
