import { describe, expect, it } from 'vitest';

import { columns, manyPages, pages } from './__fixtures__/pages';
import { applyListQuery } from './query';

describe('applyListQuery', () => {
    it('filters by value, as strings', () => {
        const result = applyListQuery(pages, { filter: { status: 'draft' } });
        expect(result.items.map((item) => item.id)).toEqual(['2', '3']);
        expect(result.total).toBe(2);
    });

    it('filters by one of several values, and by the id of references', () => {
        const items = [
            { id: '1', author: { id: '7', label: 'Ada' } },
            { id: '2', author: { id: '8', label: 'Grace' } },
        ];
        expect(applyListQuery(items, { filter: { author: ['8', '9'] } }).items).toEqual([items[1]]);
    });

    it('filters by the bounds of a range, both inclusive', () => {
        const items = [
            { id: '1', published_on: '2026-01-01' },
            { id: '2', published_on: '2026-01-31T18:00:00Z' },
            { id: '3', published_on: '2026-02-01' },
            { id: '4', published_on: null },
        ];
        const ids = (from?: string, to?: string) =>
            applyListQuery(items, {
                filter: { published_on: { ...(from && { from }), ...(to && { to }) } },
            }).items.map((item) => item.id);
        expect(ids('2026-01-01', '2026-01-31')).toEqual(['1', '2']);
        expect(ids('2026-01-31')).toEqual(['2', '3']);
        expect(ids(undefined, '2026-01-01')).toEqual(['1']);
    });

    it('searches every text value, in the locale of localized values', () => {
        expect(applyListQuery(pages, { q: 'propos' }, { columns, locale: 'fr' }).total).toBe(1);
        expect(applyListQuery(pages, { q: 'propos' }, { columns, locale: 'en' }).total).toBe(0);
        expect(applyListQuery(pages, { q: 'ABOUT' }, { columns }).items[0]?.id).toBe('1');
    });

    it('sorts by columns, descending with a dash, empty values last', () => {
        expect(
            applyListQuery(pages, { sort: ['title'] }, { columns }).items.map((item) => item.id),
        ).toEqual(['1', '3', '2']);
        expect(applyListQuery(pages, { sort: ['-title'] }, { columns }).items[0]?.id).toBe('2');
        expect(applyListQuery(pages, { sort: ['published_on'] }).items[0]?.id).toBe('1');
    });

    it('returns a page, with the total of every page', () => {
        const result = applyListQuery(manyPages(45), { page: 3, perPage: 20 });
        expect(result.items.map((item) => item.id)).toEqual(['41', '42', '43', '44', '45']);
        expect(result.total).toBe(45);
    });
});
