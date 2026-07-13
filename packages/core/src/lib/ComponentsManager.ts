import { ElementType } from 'react';

import { flattenComponents, getComponentFromName } from '../utils';
import { isObject } from 'lodash';

class ComponentsManager {
    components: Record<string, ElementType>;

    constructor(components: Record<string, ElementType> = {}) {
        this.components = flattenComponents(components);
    }

    addComponent(name: string, component: ElementType, namespace: string | null = null): this {
        return this.addComponents(
            {
                [name]: component,
            },
            namespace,
        );
    }

    addComponents(components: Record<string, ElementType>, namespace: string | null = null): this {
        const newComponents =
            namespace !== null
                ? Object.keys(components).reduce(
                      (componentsMaps, name) => ({
                          ...componentsMaps,
                          [`${namespace}.${name}`]: components[name],
                      }),
                      {},
                  )
                : components;

        this.components = {
            ...this.components,
            ...newComponents,
        };

        return this;
    }

    merge(manager: ComponentsManager, namespace: string | null = null): this {
        return this.addComponents(manager.getComponents(), namespace);
    }

    addNamespace(namespace: string | null): this {
        if (namespace === null) {
            return this;
        }
        this.components = Object.keys(this.components).reduce(
            (componentsMap, name) => ({
                ...componentsMap,
                [`${namespace}.${name}`]: this.components[name],
            }),
            {},
        );
        return this;
    }

    getComponent(name: string | ElementType, namespace: string | null = null): ElementType | null {
        if (isObject(name)) {
            return name as ElementType;
        }
        const components = this.getComponents(namespace);
        return getComponentFromName(name, components);
    }

    getComponents(namespace: string | null = null): Record<string, ElementType> | null {
        return namespace !== null
            ? Object.keys(this.components || {}).reduce<Record<string, ElementType> | null>(
                  (componentsMap, name) => {
                      const pattern = new RegExp(`^${namespace}\\.(.*)$`);
                      const matches = pattern.exec(name);
                      return matches !== null
                          ? {
                                ...(componentsMap || {}),
                                [matches[1]]: this.components[name],
                            }
                          : componentsMap;
                  },
                  null,
              )
            : this.components;
    }

    hasComponent(name: string, namespace: string | null = null): boolean {
        return (
            this.components !== null &&
            typeof this.components[namespace !== null ? `${namespace}.${name}` : name] !==
                'undefined'
        );
    }
}

export default ComponentsManager;
