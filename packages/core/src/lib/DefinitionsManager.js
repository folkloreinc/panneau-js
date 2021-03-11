import EventEmitter from 'wolfy87-eventemitter';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';

class DefinitionsManager extends EventEmitter {
    constructor(definitions = []) {
        super();

        this.definitions = definitions || [];
    }

    addDefinition(definition) {
        this.addDefinitions(isArray(definition) ? definition : [definition]);
        return this;
    }

    addDefinitions(definitions) {
        this.definitions = uniqBy([...definitions, ...this.definitions], (it) => it.id);
        this.emit('change');

        return this;
    }

    merge(manager) {
        return this.addDefinitions(manager.getDefinitions());
    }

    getDefinition(id) {
        if (id === null) {
            return null;
        }
        return this.definitions.find((it) => it.id === id) || null;
    }

    getDefinitions() {
        return this.definitions;
    }

    hasDefinition(id) {
        return this.getDefinition(id) !== null;
    }

    getComponent(id) {
        const { component = null } = this.getDefinition(id) || {};
        return component;
    }

    getComponents() {
        return this.definitions.reduce(
            (allComponents, { id, component = null }) =>
                component !== null
                    ? {
                          ...allComponents,
                          [id]: component,
                      }
                    : allComponents,
            {},
        );
    }
}

export default DefinitionsManager;
