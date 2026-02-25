import type { ComponentType } from 'react';
import ReactIs from 'react-is';

type ComponentMap = Record<string, ComponentType<unknown> | ComponentMap>;

function flattenComponents(
    components: ComponentMap | null,
    prefix: string | null = null,
): Record<string, ComponentType<unknown>> | null {
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
                      ...flattenComponents(components[key] as ComponentMap, key),
                  },
        {} as Record<string, ComponentType<unknown>>,
    );
}

export default flattenComponents;
