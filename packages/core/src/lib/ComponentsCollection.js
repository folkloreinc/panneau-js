class ComponentsCollection {
    static normalizeKey(key) {
        return key.replace(/[^A-Za-z0-9]/gi, '').toLowerCase();
    }

    constructor(components) {
        this.components = {};
        this.addComponents(components);
    }

    addComponent(key, Component) {
        this.components[ComponentsCollection.normalizeKey(key)] = Component;
    }

    addComponents(components) {
        Object.keys(components || {}).forEach((key) => {
            this.addComponent(key, components[key]);
        });
    }

    getComponents() {
        return this.components;
    }

    setComponents(components) {
        this.components = components;
        return this;
    }

    getComponent(key) {
        const normalizedKey = ComponentsCollection.normalizeKey(key);
        const foundKey = Object.keys(this.components).find(fieldKey => fieldKey === normalizedKey);
        return typeof foundKey !== 'undefined' && foundKey !== null ? this.components[foundKey] : null;
    }
}


export default ComponentsCollection;
