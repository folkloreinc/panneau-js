import { describe, expect, it } from 'vitest';

import { type DefinitionInput, validateDefinition } from '@panneau/protocol';

import {
    type Command,
    type CommandContext,
    appliesTo,
    getCommands,
    getSearchableResources,
    hasSelection,
    isSearchable,
} from './commands';
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

describe('commands in context (decision 0116)', () => {
    const page: CommandContext['page'] = {
        route: 'resource.index',
        selection: { mode: 'ids', ids: ['1', '2'] },
    };
    const publishSelected: Command = {
        id: 'publish-selected',
        label: 'Publish selected',
        when: ({ page: current }) => hasSelection(current?.selection),
        perform: () => undefined,
    };

    it('applies a command without `when` everywhere', () => {
        expect(appliesTo({ id: 'help', label: 'Help' }, { definition: null })).toBe(true);
    });

    it('applies a command with `when` only to the pages it accepts', () => {
        expect(appliesTo(publishSelected, { definition: null, page })).toBe(true);
        expect(appliesTo(publishSelected, { definition: null })).toBe(false);
        expect(
            appliesTo(publishSelected, {
                definition: null,
                page: { route: 'resource.index', selection: { mode: 'ids', ids: [] } },
            }),
        ).toBe(false);
    });

    it('counts every matching item as a selection', () => {
        expect(hasSelection({ mode: 'all', except: ['1'] })).toBe(true);
        expect(hasSelection(undefined)).toBe(false);
    });

    it('gives the page to function sources', () => {
        const commands = getCommands(
            [({ page: current }) => (current?.item !== undefined ? [publishSelected] : [])],
            { definition: null, page: { ...page, item: { id: '1', abilities: {} } } },
        );
        expect(commands.map(({ id }) => id)).toEqual(['publish-selected']);
    });
});
