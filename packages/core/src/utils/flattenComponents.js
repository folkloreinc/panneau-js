import ReactIs from 'react-is';

const flattenComponents = (components, prefix = null) => {
    if (components === null) {
        return null;
    }
    return Object.keys(components).reduce(
        (newMap, key) => ({
            ...newMap,
            [prefix !== null ? `${prefix}.${key}` : key]: ReactIs.isValidElementType(
                components[key],
            )
                ? components[key]
                : flattenComponents(components[key], key),
        }),
        {},
    );
};

export default flattenComponents;
