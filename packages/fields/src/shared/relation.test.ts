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

describe('createRelationSource: ids and creation', () => {
    const definition = {
        locales: ['fr', 'en'],
        resources: [
            {
                id: 'tags',
                label: { singular: 'tag', plural: 'tags' },
                fields: [{ name: 'name', type: 'text' }],
                itemTitle: 'name',
            },
            {
                id: 'people',
                label: { singular: 'person', plural: 'people' },
                fields: [{ name: 'title', type: 'text', localized: true }],
                itemTitle: 'title',
            },
            {
                id: 'locked',
                label: { singular: 'locked', plural: 'locked' },
                fields: [{ name: 'name', type: 'text' }],
                itemTitle: 'name',
                abilities: { create: false },
            },
            {
                id: 'untitled',
                label: { singular: 'untitled', plural: 'untitled' },
                fields: [],
            },
        ],
    };
    const item = (id: string, values: Record<string, unknown>) => ({
        id,
        version: null,
        abilities: {},
        ...values,
    });
    const signal = new AbortController().signal;

    it('resolves ids with get(), and leaves out those it doesn’t find', async () => {
        const get = vi.fn(async (_resource: string, id: string) => {
            if (id === '404') {
                throw new Error('Not found.');
            }
            return item(id, { name: `Tag ${id}` });
        });
        const source = createRelationSource(
            { list: async () => ({ data: [] }), get },
            { definition },
        );
        await expect(source.resolve?.('tags', ['1', '404', '2'], { signal })).resolves.toEqual([
            { id: '1', label: 'Tag 1' },
            { id: '2', label: 'Tag 2' },
        ]);
        expect(get).toHaveBeenCalledWith('tags', '1', { signal });
    });

    it('doesn’t resolve or create without the adapter methods and the option', () => {
        const source = createRelationSource({ list: async () => ({ data: [] }) }, { definition });
        expect(source.resolve).toBeUndefined();
        expect(source.create).toBeUndefined();
        const withCreate = createRelationSource(
            { list: async () => ({ data: [] }), create: async () => item('1', {}) },
            { definition },
        );
        expect(withCreate.create).toBeUndefined();
    });

    it('creates an item with the text as its title, in every locale when it is localized', async () => {
        const create = vi.fn(async (resource: string, values: Record<string, unknown>) =>
            item('7', resource === 'people' ? values : { name: values.name }),
        );
        const source = createRelationSource(
            { list: async () => ({ data: [] }), create },
            { definition, create: true },
        );
        await expect(source.create?.('tags', 'News')).resolves.toEqual({ id: '7', label: 'News' });
        expect(create).toHaveBeenCalledWith('tags', { name: 'News' });
        await expect(source.create?.('people', 'Ada')).resolves.toEqual({ id: '7', label: 'Ada' });
        expect(create).toHaveBeenLastCalledWith('people', { title: { fr: 'Ada', en: 'Ada' } });
    });

    it('only creates where the resource allows it and has a title field', () => {
        const source = createRelationSource(
            { list: async () => ({ data: [] }), create: async () => item('1', {}) },
            { definition, create: true },
        );
        expect(
            ['tags', 'people', 'locked', 'untitled', 'unknown'].map((id) => source.canCreate?.(id)),
        ).toEqual([true, true, false, false, false]);
    });

    it('creates with the values of a function, or nothing when it gives null', async () => {
        const create = vi.fn(async (_resource: string, values: Record<string, unknown>) =>
            item('8', values),
        );
        const source = createRelationSource(
            { list: async () => ({ data: [] }), create },
            {
                create: (text, resource) => (resource === 'emails' ? { email: text } : null),
                getLabel: (created) => String(created.email),
            },
        );
        await expect(source.create?.('emails', 'a@b.c')).resolves.toEqual({
            id: '8',
            label: 'a@b.c',
        });
        expect(source.canCreate?.('other')).toBe(false);
        await expect(source.create?.('other', 'x')).resolves.toBeNull();
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
