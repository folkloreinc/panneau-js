import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import { useMemo } from 'react';

const useActionProps = (action, value, labelPath = null) => {
    const values = useMemo(() => {
        if (value === null) {
            return null;
        }
        if (isArray(value)) {
            return value;
        }
        return value || null;
    }, [value]);

    const ids = useMemo(() => {
        if (value === null) {
            return null;
        }
        if (isArray(value)) {
            return value.map(({ id = null } = {}) => id).filter((id) => id !== null);
        }
        return value !== null && typeof value.id !== 'undefined' ? [value.id] : null;
    }, [value]);

    const idKeys = useMemo(() => (ids || []).map((id) => `${id}`).join('-'), [ids]);

    const idLabels = useMemo(
        () =>
            isArray(values)
                ? values
                      .map(
                          (it) =>
                              `#${get(it, 'id', '')}${labelPath !== null ? ` ${get(it, labelPath, '')}` : ''}`,
                      )
                      .join(', ')
                : get(value, 'id', 'no-value'),
        [ids],
    );

    const modalKey = useMemo(() => `${action}-${idKeys}`, [idKeys]);

    return {
        ids,
        idKeys,
        idLabels,
        modalKey,
    };
};

export default useActionProps;
