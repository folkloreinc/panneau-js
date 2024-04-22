import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaUpdate = () => {
    const [updating, setUpdating] = useState(false);
    const api = useMediasApi();
    const update = useCallback(
        (id, data) => {
            setUpdating(true);
            return api.update(id, data).then((response) => {
                setUpdating(false);
                return response;
            });
        },
        [api, setUpdating],
    );
    return { update, updating };
};

export default useMediaUpdate;
