import type { ElementType } from 'react';
import { isValidElementType } from 'react-is';

type ComponentMap = Record<string, ElementType | Record<string, unknown>>;

function flattenComponents(
    components: ComponentMap | null,
    prefix: string | null = null,
): Record<string, ElementType> | null {
    if (components === null) {
        return null;
    }
    return Object.keys(components).reduce(
        (newMap, key) =>
            isValidElementType(components[key])
                ? {
                      ...newMap,
                      [prefix !== null ? `${prefix}.${key}` : key]: components[key] as ElementType,
                  }
                : {
                      ...newMap,
                      ...flattenComponents(components[key] as ComponentMap, key),
                  },
        {} as Record<string, ElementType>,
    );
}

export default flattenComponents;
