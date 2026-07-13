import { pascalCase } from 'change-case';
import isFunction from 'lodash-es/isFunction';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import type { ElementType } from 'react';

function getComponentFromName(
    name: string | ElementType | null = null,
    components: Record<string, ElementType> | null = {},
    defaultComponent: ElementType | string | null = null,
): ElementType | null {
    if (components === null || name === null) {
        return !isString(defaultComponent) ? defaultComponent : null;
    }
    if (isObject(name) || isFunction(name)) {
        return name;
    }
    const pascalName = pascalCase(name);
    const pascalDefaultName = isString(defaultComponent) ? pascalCase(defaultComponent) : null;
    const component =
        components[pascalName] ||
        components[name] ||
        (isString(pascalDefaultName) ? components[pascalDefaultName] : null) ||
        (isString(defaultComponent) ? components[defaultComponent] : null) ||
        defaultComponent;
    if (!component) {
        console.warn('Could not find component from name', name, pascalName, components);
    }
    return component as ElementType | null;
}

export default getComponentFromName;
