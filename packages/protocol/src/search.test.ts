import { describe, expect, it } from 'vitest';

import { isSearchableResource, readSearchQuery, toSearchQueryParams } from './search';

const definition = {
    resources: [
        { id: 'pages', list: { search: true } },
        { id: 'articles', features: { search: true } },
        { id: 'users', list: { search: true }, features: { search: false } },
        { id: 'settings' },
    ],
};

const read = (query: string) => readSearchQuery(new URLSearchParams(query), definition);

describe('isSearchableResource', () => {
    it('reads features.search, then list.search', () => {
        expect(definition.resources.map(isSearchableResource)).toEqual([true, true, false, false]);
    });
});

describe('readSearchQuery', () => {
    it('defaults to 5 items of every searchable resource', () => {
        expect(read('q=%20%C3%A9t%C3%A9%20')).toEqual({
            query: { q: 'été', limit: 5, resources: ['pages', 'articles'] },
        });
    });

    it('reads the limit and the resources, in the order of the definition', () => {
        expect(read('q=ete&limit=20&resources=articles,pages,articles')).toEqual({
            query: { q: 'ete', limit: 20, resources: ['pages', 'articles'] },
        });
    });

    it('refuses a short search, a limit out of bounds and resources that are not searchable', () => {
        expect(read('q=a').errors).toHaveProperty('q');
        expect(read('').errors).toHaveProperty('q');
        expect(read(`q=${'a'.repeat(256)}`).errors).toHaveProperty('q');
        for (const limit of ['0', '21', '2.5', 'abc', '']) {
            expect(read(`q=ete&limit=${limit}`).errors).toHaveProperty('limit');
        }
        expect(read('q=ete&resources=users').errors).toHaveProperty('resources');
        expect(read('q=ete&resources=unknown').errors).toHaveProperty('resources');
        expect(read('q=ete&resources=').errors).toHaveProperty('resources');
    });
});

describe('toSearchQueryParams', () => {
    it('writes what read reads', () => {
        const params = toSearchQueryParams({ q: 'été', limit: 20, resources: ['pages'] });
        expect(params.toString()).toBe('q=%C3%A9t%C3%A9&limit=20&resources=pages');
        expect(readSearchQuery(params, definition).query).toEqual({
            q: 'été',
            limit: 20,
            resources: ['pages'],
        });
    });
});
