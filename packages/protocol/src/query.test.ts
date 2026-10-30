import { describe, expect, it } from 'vitest';

import {
    type ListQuery,
    fromSearchParams,
    isFilterRange,
    matchesFilterRange,
    toSearchParams,
} from './query';

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

    it('sends and reads the cursor of a page', () => {
        const params = toSearchParams({ perPage: 50, cursor: 'eyJpZCI6NDJ9' });
        expect(params.toString()).toBe('perPage=50&cursor=eyJpZCI6NDJ9');
        expect(fromSearchParams(params)).toEqual({ perPage: 50, cursor: 'eyJpZCI6NDJ9' });
    });

    it('ignores invalid numbers and empty values', () => {
        expect(fromSearchParams(new URLSearchParams('page=abc&perPage=-1&sort=&q='))).toEqual({});
    });

    it('sends the bounds of a range as their own keys, without an open end', () => {
        const params = toSearchParams({
            filter: {
                published_at: { from: '2026-01-01', to: '2026-01-31' },
                updated_at: { from: '2026-02-01', to: '' },
                views: { to: 100 },
            },
        });
        expect(decodeURIComponent(params.toString())).toBe(
            'filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31&filter[updated_at][from]=2026-02-01&filter[views][to]=100',
        );
    });

    it('parses the bounds of a range', () => {
        expect(
            fromSearchParams(
                new URLSearchParams(
                    'filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31&filter[updated_at][to]=2026-03-01&filter[views][from]=',
                ),
            ).filter,
        ).toEqual({
            published_at: { from: '2026-01-01', to: '2026-01-31' },
            updated_at: { to: '2026-03-01' },
        });
        const query: ListQuery = { filter: { published_at: { from: '2026-01-01' } } };
        expect(fromSearchParams(toSearchParams(query))).toEqual(query);
    });

    it('ignores keys inside a filter other than the bounds', () => {
        expect(fromSearchParams(new URLSearchParams('filter[status][eq]=draft'))).toEqual({});
    });

    it('tells ranges from other filter values', () => {
        expect(isFilterRange({ from: '2026-01-01' })).toBe(true);
        expect(isFilterRange({})).toBe(true);
        expect(isFilterRange(['2026-01-01', '2026-01-31'])).toBe(false);
        expect(isFilterRange('2026-01-01')).toBe(false);
        expect(isFilterRange(null)).toBe(false);
    });

    it('matches values within the bounds of a range, both inclusive', () => {
        const january = { from: '2026-01-01', to: '2026-01-31' };
        expect(matchesFilterRange('2026-01-01', january)).toBe(true);
        expect(matchesFilterRange('2026-01-31T23:59:59Z', january)).toBe(true);
        expect(matchesFilterRange('2025-12-31T23:59:59Z', january)).toBe(false);
        expect(matchesFilterRange('2026-02-01', january)).toBe(false);
        expect(matchesFilterRange('2026-02-01', { from: '2026-01-01' })).toBe(true);
        expect(matchesFilterRange('2025-02-01', { to: '2026-01-01', from: '' })).toBe(true);
        expect(matchesFilterRange(null, { from: '2026-01-01' })).toBe(false);
        expect(matchesFilterRange('', {})).toBe(false);
        expect(matchesFilterRange(50, { from: '10', to: '100' })).toBe(true);
        expect(matchesFilterRange(500, { from: '10', to: '100' })).toBe(false);
    });
});
