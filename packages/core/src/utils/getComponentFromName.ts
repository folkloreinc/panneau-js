import { pascalCase } from 'change-case';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import type { ElementType } from 'react';

function getComponentFromName(
    name: string | ElementType | null = null,
    components: Record<string, ElementType> | null = {},
    defaultComponent: ElementType | null = null,
): ElementType | null {
    if (components === null || name === null) {
        return defaultComponent;
    }
    if (isObject(name) || isFunction(name)) {
        return name;
    }
    const pascalName = pascalCase(name);
    const component = components[pascalName] || components[name] || defaultComponent;
    if (!component) {
        console.warn('Could not find component from name', name, pascalName, components);
    }
    return component;
}

export default getComponentFromName;
