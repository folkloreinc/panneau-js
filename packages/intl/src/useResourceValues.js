import { useMemo } from 'react';

import { useResource } from '@panneau/core/contexts';

const useResourceValues = (resource, values = null) => {
    const contextResource = useResource();
    const allValues = useMemo(() => {
        const { name = null, intl: { values: resourceValues } = {} } =
            resource || contextResource || {};
        return {
            name,
            ...resourceValues,
            ...values,
        };
    }, [resource, values, contextResource]);

    return allValues;
};

export default useResourceValues;
