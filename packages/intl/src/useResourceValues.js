import { useMemo } from 'react';

import { useResource } from '@panneau/core/contexts';

const useResourceValues = (resource, values = null) => {
    const allValues = useMemo(() => {
        const contextResource = useResource();
        const { name = null, intl: { values: resourceValues } = {} } =
            resource || contextResource || {};
        return {
            name,
            ...resourceValues,
            ...values,
        };
    }, [resource, values]);

    return allValues;
};

export default useResourceValues;
