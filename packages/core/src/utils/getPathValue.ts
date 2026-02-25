import get from 'lodash/get';
import isObject from 'lodash/isObject';

const getPathValue = (it: unknown, path: string | string[]): unknown => {
    const value = get(it, path, null);
    return value !== null && isObject(value)
        ? Object.values(value as Record<string, unknown>).reduce(
              (foundValue, val) => (foundValue !== null ? foundValue : val),
              null,
          )
        : value;
};

export default getPathValue;
