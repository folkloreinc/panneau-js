import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';

interface Definition {
    id: string;
    component?: unknown;
    [key: string]: unknown;
}

class DefinitionsManager {
    definitions: Definition[];

    constructor(definitions: Definition[] = []) {
        this.definitions = definitions || [];
    }

    addDefinition(definition: Definition | Definition[]): this {
        this.addDefinitions(isArray(definition) ? definition : [definition]);
        return this;
    }

    addDefinitions(definitions: Definition[]): this {
        this.definitions = uniqBy([...definitions, ...this.definitions], (it) => it.id);
        return this;
    }

    merge(manager: DefinitionsManager): this {
        return this.addDefinitions(manager.getDefinitions());
    }

    getDefinition(id: string | null): Definition | null {
        if (id === null) {
            return null;
        }
        return this.definitions.find((it) => it.id === id) || null;
    }

    getDefinitions(): Definition[] {
        return this.definitions;
    }

    hasDefinition(id: string): boolean {
        return this.getDefinition(id) !== null;
    }

    getComponent(id: string): unknown {
        const { component = null } = this.getDefinition(id) || {};
        return component;
    }

    getComponents(): Record<string, unknown> {
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
