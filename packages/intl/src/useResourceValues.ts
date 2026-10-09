import { useMemo } from 'react';

import type { MessageValues, Resource, ResourceIntlValues } from '@panneau/core';
import { useResource } from '@panneau/core/contexts';

function useResourceValues(
    resource: Resource | null,
    values: MessageValues | null = null,
): ResourceIntlValues {
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
