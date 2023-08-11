import { flattenComponents, getComponentFromName } from '../utils';

class ComponentsManager {
    constructor(components = {}) {
        this.components = flattenComponents(components);
    }

    addComponent(name, component, namespace = null) {
        return this.addComponents(
            {
                [name]: component,
            },
            namespace,
        );
    }

    addComponents(components, namespace = null) {
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

    merge(manager, namespace = null) {
        return this.addComponents(manager.getComponents(), namespace);
    }

    addNamespace(namespace) {
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

    getComponent(name, namespace = null) {
        const components = this.getComponents(namespace);
        return getComponentFromName(name, components);
    }

    getComponents(namespace = null) {
        return namespace !== null
            ? Object.keys(this.components || {}).reduce((componentsMap, name) => {
                  const pattern = new RegExp(`^${namespace}\\.(.*)$`);
                  const matches = pattern.exec(name);
                  return matches !== null
                      ? {
                            ...componentsMap,
                            [matches[1]]: this.components[name],
                        }
                      : componentsMap;
              }, null)
            : this.components;
    }

    hasComponent(name, namespace = null) {
        return (
            this.components !== null &&
            typeof this.components[namespace !== null ? `${namespace}.${name}` : name] !==
                'undefined'
        );
    }
}

export default ComponentsManager;
