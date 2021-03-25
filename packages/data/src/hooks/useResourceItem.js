import { useCallback } from 'react';

import { useApi } from '../contexts/ApiContext';
import useData from './useData';

const useResourceItem = (resource, id, opts) => {
    const api = useApi();
    const loader = useCallback(() => api.resources.find(resource, id), [api, resource, id]);
    const { data, ...request } = useData(loader, opts);
    return {
        item: data,
        ...request,
    };
};

export default useResourceItem;
