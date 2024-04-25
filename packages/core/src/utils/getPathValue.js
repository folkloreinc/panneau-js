import get from 'lodash/get';
import isObject from 'lodash/isObject';

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
