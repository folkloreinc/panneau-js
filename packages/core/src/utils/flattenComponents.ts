import type { ElementType } from 'react';
import { isValidElementType } from 'react-is';

import type { ComponentsMap } from '../types';

function flattenComponents(
    components: ComponentsMap | null,
    prefix: string | null = null,
): Record<string, ElementType> | null {
    if (components === null) {
        return null;
    }
    return Object.keys(components).reduce(
        (newMap, key) => {
            const path = prefix !== null ? `${prefix}.${key}` : key;
            return isValidElementType(components[key])
                ? {
                      ...newMap,
                      [path]: components[key] as ElementType,
                  }
                : {
                      ...newMap,
                      ...flattenComponents(components[key] as ComponentsMap, path),
                  };
        },
        {} as Record<string, ElementType>,
    );
}

export default flattenComponents;
