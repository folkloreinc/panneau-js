import { useCallback, useState } from 'react';

import { useApi } from '../contexts/ApiContext';

const useMediaUpdate = () => {
    const [updating, setUpdating] = useState(false);
    const api = useApi();
    const update = useCallback(
        (id, data) => {
            setUpdating(true);
            return api.medias.update(id, data).then((response) => {
                setUpdating(false);
                return response;
            });
        },
        [api, setUpdating],
    );
    return { update, updating };
};

export default useMediaUpdate;
