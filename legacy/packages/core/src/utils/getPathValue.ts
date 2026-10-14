import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';

function getPathValue(it: unknown, path: string | string[]): unknown {
    const value = get(it, path, null);
    return value !== null && isObject(value)
        ? Object.values(value as Record<string, unknown>).reduce(
              (foundValue, val) => (foundValue !== null ? foundValue : val),
              null,
          )
        : value;
}

export default getPathValue;
