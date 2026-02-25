import { useMemo } from 'react';

import type { Resource, ResourceValues } from '@panneau/core';
import { useResource } from '@panneau/core/contexts';

function useResourceValues(
    resource: Resource | null,
    values: Record<string, unknown> = null,
): ResourceValues {
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
}

export default useResourceValues;
