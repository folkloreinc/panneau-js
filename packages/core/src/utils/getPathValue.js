import get from 'lodash-es/get';
import isObject from 'lodash-es/isObject';

const getPathValue = (it, path) => {
    const value = get(it, path, null);
    return value !== null && isObject(value)
        ? Object.values(value).reduce(
              (foundValue, val) => (foundValue !== null ? foundValue : val),
              null,
          )
        : value;
};

export default getPathValue;
