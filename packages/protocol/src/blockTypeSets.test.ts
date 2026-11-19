import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { resolveBlockTypeSets } from './blockTypeSets';
import type { BlockType, DefinitionInput, Field, ResourceInput } from './schemas';
import { validateBootConfig, validateDefinition } from './validate';

const text: BlockType = { id: 'text', label: 'Text', fields: [{ name: 'body', type: 'textarea' }] };

function createPages(fields: Field[], types: ResourceInput['types'] = undefined): ResourceInput {
    return {
        id: 'blocks-pages',
        label: { singular: 'page', plural: 'pages' },
        fields: [{ name: 'title', type: 'text' }, ...fields],
        ...(types !== undefined ? { types } : {}),
    };
}

function withSets(
    pages: ResourceInput,
    blockTypeSets: Record<string, BlockType[]>,
): DefinitionInput {
    const definition = createDefinition();
    return { ...definition, resources: [...definition.resources, pages], blockTypeSets };
}

function pagesOf(definition: { resources: ResourceInput[] }): ResourceInput {
    const pages = definition.resources.find((resource) => resource.id === 'blocks-pages');
    if (pages === undefined) {
        throw new Error('No pages.');
    }
    return pages;
}

describe('shared block types (decision 0094)', () => {
    it('gives the repeaters that name a set its types, the same array for each', () => {
        const stack: BlockType = {
            id: 'stack',
            label: 'Stack',
            fields: [{ name: 'blocks', type: 'repeater', typeSet: 'inner' }],
        };
        const input = withSets(
            createPages(
                [],
                [
                    {
                        id: 'page',
                        label: 'Page',
                        fields: [{ name: 'blocks', type: 'repeater', typeSet: 'blocks' }],
                    },
                    {
                        id: 'home',
                        label: 'Home',
                        fields: [{ name: 'blocks', type: 'repeater', typeSet: 'blocks' }],
                    },
                ],
            ),
            { blocks: [text, stack], inner: [text] },
        );

        const result = validateDefinition(input);

        expect(result.success).toBe(true);
        if (!result.success) return;
        const [page, home] = pagesOf(result.data).types ?? [];
        const pageBlocks = page?.fields[0]?.types;
        expect(pageBlocks?.map((type) => type.id)).toEqual(['text', 'stack']);
        expect(home?.fields[0]?.types).toBe(pageBlocks);
        expect(pageBlocks?.[1]?.fields[0]?.types?.map((type) => type.id)).toEqual(['text']);
    });

    it('resolves the sets of an inlined definition', () => {
        const definition = withSets(
            createPages([{ name: 'blocks', type: 'repeater', typeSet: 'blocks' }]),
            { blocks: [text] },
        );

        const result = validateBootConfig({
            protocol: 1,
            apiBaseUrl: '/panneau/api',
            basePath: '/panneau',
            locale: 'en',
            definition,
        });

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(pagesOf(result.data.definition ?? { resources: [] }).fields[1]?.types?.[0]?.id).toBe(
            'text',
        );
    });

    it('checks the settings of the fields of a set', () => {
        const result = validateDefinition(
            withSets(createPages([{ name: 'blocks', type: 'repeater', typeSet: 'blocks' }]), {
                blocks: [
                    {
                        id: 'rich',
                        label: 'Rich',
                        fields: [{ name: 'body', type: 'richtext', settings: { toolbar: 'bold' } }],
                    },
                ],
            }),
        );

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.issues.some((issue) => issue.path.endsWith('.settings.toolbar'))).toBe(true);
    });

    it('refuses a set that is missing, a field with types and a typeSet, and a set that holds itself', () => {
        const loop: BlockType = {
            id: 'stack',
            label: 'Stack',
            fields: [{ name: 'blocks', type: 'repeater', typeSet: 'loop' }],
        };
        const definition = withSets(
            createPages([
                { name: 'missing', type: 'repeater', typeSet: 'nothing' },
                { name: 'both', type: 'repeater', typeSet: 'loop', types: [text] },
            ]),
            { loop: [loop] },
        );

        const result = validateDefinition(definition);

        expect(result.success).toBe(false);
        if (result.success) return;
        const messages = result.issues.map((issue) => `${issue.path}: ${issue.message}`);
        expect(messages).toEqual(
            expect.arrayContaining([
                expect.stringMatching(/fields\.1\.typeSet: No block type set `nothing`/),
                expect.stringMatching(/fields\.2\.typeSet: A field has `types` or a `typeSet`/),
                expect.stringMatching(/blockTypeSets\.loop\.0\.fields\.0\.typeSet: .*holds itself/),
            ]),
        );
    });

    it('leaves a definition without sets as it is', () => {
        const definition = createDefinition() as Parameters<typeof resolveBlockTypeSets>[0];
        const before = JSON.stringify(definition);

        expect(resolveBlockTypeSets(definition)).toEqual([]);
        expect(JSON.stringify(definition)).toBe(before);
    });
});
