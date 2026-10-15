import { describe, expect, it } from 'vitest';

import { isEqual, isPathWithin, setValue } from './values';

describe('setValue', () => {
    it('sets values at dot paths without changing the original', () => {
        const values = { title: { fr: 'Accueil' }, blocks: [{ body: 'a' }] };
        const next = setValue(values, 'title.en', 'Home');
        expect(next).toEqual({ title: { fr: 'Accueil', en: 'Home' }, blocks: [{ body: 'a' }] });
        expect(values.title).toEqual({ fr: 'Accueil' });
        expect(next.blocks).toBe(values.blocks);
    });

    it('creates missing objects and arrays', () => {
        expect(setValue({}, 'blocks.1.body', 'b')).toEqual({ blocks: [undefined, { body: 'b' }] });
        expect(setValue({ seo: null }, 'seo.description', 'd')).toEqual({
            seo: { description: 'd' },
        });
    });

    it('replaces everything with an empty path', () => {
        expect(setValue({ a: 1 }, '', { b: 2 })).toEqual({ b: 2 });
    });
});

describe('isEqual', () => {
    it('compares JSON-like values deeply', () => {
        expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
        expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(true);
        expect(isEqual({ a: [1] }, { a: [1, 2] })).toBe(false);
        expect(isEqual([], {})).toBe(false);
        expect(isEqual(null, {})).toBe(false);
        expect(isEqual(Number.NaN, Number.NaN)).toBe(true);
    });
});

describe('isPathWithin', () => {
    it('matches a path and its children', () => {
        expect(isPathWithin('title.fr', 'title')).toBe(true);
        expect(isPathWithin('title', 'title')).toBe(true);
        expect(isPathWithin('titles', 'title')).toBe(false);
        expect(isPathWithin('anything', '')).toBe(true);
    });
});
