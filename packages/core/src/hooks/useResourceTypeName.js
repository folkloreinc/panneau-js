import { useMemo } from 'react';

const useResourceTypeName = (resource, type = null) => {
    const typeName = useMemo(() => {
        const { name: resourceName = null, types = [], settings = {} } = resource || {};
        const { hideTypeNames = false } = settings || {};
        if (hideTypeNames) {
            return null;
        }
        const { name = null } =
            type !== null && types !== null && types.length > 1
                ? (types || []).find(({ id = null }) => id === type) || {}
                : {};
        return name === resourceName ? null : name;
    }, [type, resource]);

    return typeName;
};

export default useResourceTypeName;
