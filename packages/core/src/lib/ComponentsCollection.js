class ComponentsCollection {
    static normalizeKey(key) {
        return key.replace(/[^A-Za-z0-9.]/gi, '').toLowerCase();
    }

    constructor(components) {
        this.components = {};
        this.addComponents(components || {});
    }

    addComponent(key, Component, namespace) {
        const componentKey = ComponentsCollection.normalizeKey((
            `${typeof namespace !== 'undefined' ? `${namespace}.` : ''}${key}`
        ));
        this.components[componentKey] = Component;
    }

    addComponents(components, namespace) {
        const items = components instanceof ComponentsCollection
            ? components.getComponents() : components;
        Object.keys(items).forEach((key) => {
            this.addComponent(key, items[key], namespace);
        });
    }

    getCollection(namespace) {
        const components = this.getComponents(namespace);
        const collection = new ComponentsCollection(components);
        return collection;
    }

    getComponents(namespace) {
        return Object.keys(this.components).reduce((components, key) => {
            if (typeof namespace !== 'undefined') {
                const namespaceKey = ComponentsCollection.normalizeKey(namespace);
                // eslint-disable-next-line no-useless-escape
                const matches = key.match(new RegExp(`^${namespaceKey}\.(.*)$`, 'i'));
                return matches ? {
                    ...components,
                    [matches[1]]: this.components[key],
                } : components;
            }
            return {
                ...components,
                [key]: this.components[key],
            };
        }, {});
    }

    setComponents(components, namespace) {
        const items = components instanceof ComponentsCollection
            ? components.getComponents() : components;
        if (typeof namespace !== 'undefined') {
            Object.keys(items).forEach((key) => {
                this.components[`${namespace}.${key}`] = items[key];
            });
        } else {
            this.components = items;
        }
        return this;
    }

    getComponent(key) {
        const normalizedKey = ComponentsCollection.normalizeKey(key);
        const foundKey = Object.keys(this.components).find(fieldKey => fieldKey === normalizedKey);
        return typeof foundKey !== 'undefined' && foundKey !== null ? this.components[foundKey] : null;
    }
}


export default ComponentsCollection;
