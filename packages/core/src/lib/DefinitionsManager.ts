import isArray from 'lodash-es/isArray';
import uniqBy from 'lodash-es/uniqBy';

interface Definition {
    id: string;
    component?: unknown;
    [key: string]: unknown;
}

class DefinitionsManager<T extends Definition = Definition> {
    definitions: T[];

    constructor(definitions: T[] = []) {
        this.definitions = definitions || [];
    }

    addDefinition(definition: T | T[]): this {
        this.addDefinitions(isArray(definition) ? definition : [definition]);
        return this;
    }

    addDefinitions(definitions: T[]): this {
        this.definitions = uniqBy([...definitions, ...this.definitions], (it) => it.id);
        return this;
    }

    merge(manager: DefinitionsManager<T>): this {
        return this.addDefinitions(manager.getDefinitions());
    }

    getDefinition(id: string | null): T | null {
        if (id === null) {
            return null;
        }
        return this.definitions.find((it) => it.id === id) || null;
    }

    getDefinitions(): T[] {
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
