import { useMemo } from 'react';

import { useResource } from '@panneau/core/contexts';
import type { Resource, ResourceValues } from '@panneau/core/types';

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
