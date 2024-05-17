import { useCallback, useState } from 'react';

import { useMediasApi } from '../MediasApiContext';

const useMediaReplace = () => {
    const [replacing, setReplacing] = useState(false);
    const api = useMediasApi();
    const mediaReplace = useCallback(
        (id, data) => {
            setReplacing(true);
            return api.replace(id, data).then((response) => {
                setReplacing(false);
                return response;
            });
        },
        [api, setReplacing],
    );
    return { mediaReplace, replacing };
};

export default useMediaReplace;
