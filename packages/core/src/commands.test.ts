import { describe, expect, it } from 'vitest';

import { type DefinitionInput, validateDefinition } from '@panneau/protocol';

import { getCommands, getSearchableResources, isSearchable } from './commands';
import { createPluginRegistry } from './plugins';

function parse(input: DefinitionInput) {
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return result.data;
}

const resource = (id: string, extra: Partial<DefinitionInput['resources'][number]> = {}) => ({
    id,
    label: { singular: id, plural: id },
    fields: [],
    ...extra,
});

describe('commands', () => {
    it('come from every plugin, as lists or made for the definition', () => {
        const registry = createPluginRegistry([
            { id: 'a', commands: [{ id: 'docs', label: 'Read the docs', href: '/docs' }] },
            { id: 'b' },
            {
                id: 'c',
                commands: ({ definition }) => [
                    { id: 'site', label: `Open ${definition?.name ?? 'the site'}`, href: '/' },
                ],
            },
        ]);
        const definition = parse({
            protocol: 1,
            name: 'Journal',
            locale: 'en',
            locales: ['en'],
            api: { baseUrl: '/api' },
            resources: [],
        });
        expect(
            getCommands(registry.commands, { definition }).map((command) => command.label),
        ).toEqual(['Read the docs', 'Open Journal']);
        expect(getCommands(registry.commands, { definition: null })[1]?.label).toBe(
            'Open the site',
        );
    });
});

describe('searchable resources', () => {
    it('follow features.search, then the search of their list', () => {
        const definition = parse({
            protocol: 1,
            name: 'Journal',
            locale: 'en',
            locales: ['en'],
            api: { baseUrl: '/api' },
            resources: [
                resource('pages', { list: { search: true } }),
                resource('authors', { list: { search: true }, features: { search: false } }),
                resource('tags', { features: { search: true } }),
                resource('logs'),
                resource('users', { features: { search: true }, abilities: { viewAny: false } }),
            ],
        });
        expect(definition.resources.map(isSearchable)).toEqual([true, false, true, false, true]);
        expect(getSearchableResources(definition).map(({ id }) => id)).toEqual(['pages', 'tags']);
    });
});
