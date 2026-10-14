import { describe, expect, it } from 'vitest';

import { type ListQuery, fromSearchParams, toSearchParams } from './query';

describe('list queries', () => {
    it('serializes to the protocol format', () => {
        const params = toSearchParams({
            page: 2,
            perPage: 10,
            sort: ['-published_at', 'title'],
            filter: { status: 'published', tags: ['a', 'b'] },
            q: 'été',
            fields: ['title', 'status'],
        });
        expect(decodeURIComponent(params.toString())).toBe(
            'page=2&perPage=10&sort=-published_at,title&filter[status]=published&filter[tags][]=a&filter[tags][]=b&q=été&fields=title,status',
        );
    });

    it('parses what it serializes', () => {
        const query: ListQuery = {
            page: 3,
            perPage: 5,
            sort: ['title'],
            filter: { status: 'draft', tags: ['a', 'b'] },
            q: 'search',
            fields: ['title'],
        };
        expect(fromSearchParams(toSearchParams(query))).toEqual(query);
    });

    it('ignores invalid numbers and empty values', () => {
        expect(fromSearchParams(new URLSearchParams('page=abc&perPage=-1&sort=&q='))).toEqual({});
    });
});
