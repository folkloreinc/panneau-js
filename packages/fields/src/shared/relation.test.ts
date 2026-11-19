import { describe, expect, it, vi } from 'vitest';

import type { Item, ListQuery } from '@panneau/protocol';
import { IDS_FILTER, IDS_FILTER_LIMIT } from '@panneau/protocol/runtime';

import { type RelationListAdapter, createRelationSource, toReferences } from './relation';

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

    it('describes items with the itemSubtitle and the itemImage of the resource, and links them', async () => {
        const list = vi.fn(async () => ({
            data: [
                {
                    id: '1',
                    version: null,
                    abilities: {},
                    name: 'Ada',
                    role: 'Writer',
                    photo: { id: 'm1', label: 'Ada', media: { thumbnailUrl: 'https://x/1.jpg' } },
                },
                { id: '2', version: null, abilities: {}, name: 'Grace' },
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
                            icon: 'users',
                            fields: [],
                            itemTitle: 'name',
                            itemSubtitle: 'role',
                            itemImage: 'photo',
                        },
                        {
                            id: 'pages',
                            label: { singular: 'page', plural: 'pages' },
                            fields: [],
                        },
                    ],
                },
                getItemHref: (resource, id) => `/${resource}/${id}`,
            },
        );
        await expect(
            source.search('authors', '', { signal: new AbortController().signal }),
        ).resolves.toEqual([
            { id: '1', label: 'Ada', description: 'Writer', imageUrl: 'https://x/1.jpg' },
            { id: '2', label: 'Grace' },
        ]);
        expect(source.describe?.('authors')).toEqual({
            icon: 'users',
            image: true,
            description: true,
        });
        expect(source.describe?.('pages')).toEqual({ image: false, description: false });
        expect(source.describe?.('nope')).toBeNull();
        expect(source.getItemHref?.('authors', '1')).toBe('/authors/1');
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

    it('resolves the ids of every field in one list query, and keeps the items', async () => {
        const list = vi.fn(async (_resource: string, query?: ListQuery) => ({
            data: ((query?.filter?.[IDS_FILTER] ?? []) as string[])
                .filter((id) => id !== '404')
                .map((id) => item(id, { name: `Tag ${id}` })),
        }));
        const source = createRelationSource({ list }, { definition });
        const [first, second] = await Promise.all([
            source.resolve?.('tags', ['1', '404'], { signal }),
            source.resolve?.('tags', ['2', '1'], { signal }),
        ]);
        expect(first).toEqual([{ id: '1', label: 'Tag 1' }]);
        expect(second).toEqual([
            { id: '2', label: 'Tag 2' },
            { id: '1', label: 'Tag 1' },
        ]);
        expect(list).toHaveBeenCalledTimes(1);
        expect(list).toHaveBeenCalledWith('tags', {
            filter: { [IDS_FILTER]: ['1', '404', '2'] },
            perPage: 3,
        });
        // The source has them now, and remembers the ids it didn't find
        expect(source.peek?.('tags', '2')).toEqual({ id: '2', label: 'Tag 2' });
        expect(source.peek?.('tags', '404')).toBeNull();
        expect(source.peek?.('tags', '3')).toBeUndefined();
        await source.resolve?.('tags', ['1', '2', '404'], { signal });
        expect(list).toHaveBeenCalledTimes(1);
    });

    it('asks for an id once, also when fields ask for it apart, while its request is in flight', async () => {
        const answers: (() => void)[] = [];
        const list = vi.fn(
            (_resource: string, query?: ListQuery) =>
                new Promise<{ data: Item[] }>((resolve) => {
                    // Answered when the test says so, not after some time
                    answers.push(() =>
                        resolve({
                            data: ((query?.filter?.[IDS_FILTER] ?? []) as string[]).map((id) =>
                                item(id, { name: `Tag ${id}` }),
                            ),
                        }),
                    );
                }),
        );
        const source = createRelationSource({ list }, { definition });
        const first = source.resolve?.('tags', ['1', '2'], { signal });
        // A field that asks later, once the first request has gone
        await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(1));
        const second = source.resolve?.('tags', ['2', '3'], { signal });
        await vi.waitFor(() => expect(list).toHaveBeenCalledTimes(2));
        expect(list.mock.calls.map(([, query]) => query?.filter?.[IDS_FILTER])).toEqual([
            ['1', '2'],
            ['3'],
        ]);
        answers.forEach((answer) => answer());
        await expect(first).resolves.toEqual([
            { id: '1', label: 'Tag 1' },
            { id: '2', label: 'Tag 2' },
        ]);
        await expect(second).resolves.toEqual([
            { id: '2', label: 'Tag 2' },
            { id: '3', label: 'Tag 3' },
        ]);
        // Then from the items it keeps, without a request
        await source.resolve?.('tags', ['1', '3'], { signal });
        expect(list).toHaveBeenCalledTimes(2);
    });

    it('asks for the ids by groups of IDS_FILTER_LIMIT', async () => {
        const list = vi.fn(async (_resource: string, query?: ListQuery) => ({
            data: ((query?.filter?.[IDS_FILTER] ?? []) as string[]).map((id) =>
                item(id, { name: `Tag ${id}` }),
            ),
        }));
        const source = createRelationSource({ list }, { definition });
        const ids = Array.from({ length: IDS_FILTER_LIMIT + 5 }, (_, index) => String(index + 1));
        await expect(source.resolve?.('tags', ids, { signal })).resolves.toHaveLength(ids.length);
        expect(list.mock.calls.map(([, query]) => query?.perPage)).toEqual([IDS_FILTER_LIMIT, 5]);
    });

    it('reads and fills the cache of items it is given', async () => {
        const cached = new Map<string, Item>([['tags/1', item('1', { name: 'Cached' })]]);
        const items = {
            get: (resource: string, id: string) => cached.get(`${resource}/${id}`),
            set: vi.fn((resource: string, value: Item) =>
                cached.set(`${resource}/${value.id}`, value),
            ),
        };
        const list = vi.fn(async () => ({ data: [item('2', { name: 'Fetched' })] }));
        const source = createRelationSource({ list }, { definition, items });
        expect(source.peek?.('tags', '1')).toEqual({ id: '1', label: 'Cached' });
        await expect(source.resolve?.('tags', ['1', '2'], { signal })).resolves.toEqual([
            { id: '1', label: 'Cached' },
            { id: '2', label: 'Fetched' },
        ]);
        expect(list).toHaveBeenCalledWith('tags', {
            filter: { [IDS_FILTER]: ['2'] },
            perPage: 1,
        });
        expect(items.set).toHaveBeenCalledWith('tags', item('2', { name: 'Fetched' }));
    });

    it('asks again for ids whose request failed', async () => {
        const list = vi
            .fn<RelationListAdapter['list']>()
            .mockRejectedValueOnce(new Error('Offline.'))
            .mockResolvedValue({ data: [item('1', { name: 'Tag 1' })] });
        const source = createRelationSource({ list }, { definition });
        await expect(source.resolve?.('tags', ['1'], { signal })).resolves.toEqual([]);
        expect(source.peek?.('tags', '1')).toBeUndefined();
        await expect(source.resolve?.('tags', ['1'], { signal })).resolves.toEqual([
            { id: '1', label: 'Tag 1' },
        ]);
    });

    it('doesn’t create without the adapter’s create() and the option', () => {
        const source = createRelationSource({ list: async () => ({ data: [] }) }, { definition });
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
    it('keeps the description and the image of references', () => {
        expect(
            toReferences({ id: 1, label: 'Ada', description: 'Writer', imageUrl: 'https://x' }),
        ).toEqual([{ id: '1', label: 'Ada', description: 'Writer', imageUrl: 'https://x' }]);
    });

    it('reads references, ids and lists', () => {
        expect(toReferences(null)).toEqual([]);
        expect(toReferences('12')).toEqual([{ id: '12', label: '12' }]);
        expect(toReferences([{ id: 3 }, { id: '4', label: 'Four' }, { nope: true }])).toEqual([
            { id: '3', label: '3' },
            { id: '4', label: 'Four' },
        ]);
    });
});
