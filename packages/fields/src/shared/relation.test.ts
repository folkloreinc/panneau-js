import { describe, expect, it, vi } from 'vitest';

import { createRelationSource, toReferences } from './relation';

describe('createRelationSource', () => {
    it('searches with a list query, labelled by the itemTitle of the resource', async () => {
        const list = vi.fn(async () => ({
            data: [
                { id: '1', version: null, abilities: {}, name: { fr: 'Ada', en: 'Ada L.' } },
                { id: '2', version: null, abilities: {} },
            ],
        }));
        const source = createRelationSource(
            { list },
            {
                definition: {
                    resources: [
                        {
                            id: 'authors',
                            label: { singular: 'a', plural: 'b' },
                            fields: [],
                            itemTitle: 'name',
                        },
                    ],
                },
                perPage: 5,
            },
        );
        const signal = new AbortController().signal;
        await expect(source.search('authors', 'ad', { signal })).resolves.toEqual([
            { id: '1', label: 'Ada' },
            { id: '2', label: '2' },
        ]);
        expect(list).toHaveBeenCalledWith('authors', { page: 1, perPage: 5, q: 'ad' }, { signal });
    });

    it('labels items with getLabel', async () => {
        const source = createRelationSource(
            {
                list: async () => ({
                    data: [{ id: '1', version: null, abilities: {}, email: 'a@b.c' }],
                }),
            },
            { getLabel: (item) => String(item.email) },
        );
        await expect(
            source.search('users', '', { signal: new AbortController().signal }),
        ).resolves.toEqual([{ id: '1', label: 'a@b.c' }]);
    });
});

describe('toReferences', () => {
    it('reads references, ids and lists', () => {
        expect(toReferences(null)).toEqual([]);
        expect(toReferences('12')).toEqual([{ id: '12', label: '12' }]);
        expect(toReferences([{ id: 3 }, { id: '4', label: 'Four' }, { nope: true }])).toEqual([
            { id: '3', label: '3' },
            { id: '4', label: 'Four' },
        ]);
    });
});
