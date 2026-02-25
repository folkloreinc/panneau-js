import { pascalCase } from 'change-case';
import type { ComponentType } from 'react';

const getComponentFromName = <T = ComponentType<unknown> | 'string'>(
    name: string | null = null,
    components: Record<string, T> | null = {},
    defaultComponent: T | null = null,
): T | null => {
    if (components === null || name === null) {
        return defaultComponent;
    }
    const pascalName = pascalCase(name);
    const component = components[pascalName] || components[name] || defaultComponent;
    if (!component) {
        console.warn('Could not find component from name', name, pascalName, components);
    }
    return component;
};

export default getComponentFromName;
