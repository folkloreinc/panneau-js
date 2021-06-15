import ReactIs from 'react-is';

const flattenComponents = (components, prefix = null) => {
    if (components === null) {
        return null;
    }
    return Object.keys(components).reduce(
        (newMap, key) =>
            ReactIs.isValidElementType(components[key])
                ? {
                      ...newMap,
                      [prefix !== null ? `${prefix}.${key}` : key]: components[key],
                  }
                : {
                      ...newMap,
                      ...flattenComponents(components[key], key),
                  },
        {},
    );
};

export default flattenComponents;
