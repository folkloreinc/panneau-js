import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { checkRules, checkValues } from './rules';
import type { Field } from './schemas';

function pagesFields(): Field[] {
    const pages = createDefinition().resources[0];
    if (pages === undefined) {
        throw new Error('Fixture has no resources.');
    }
    return pages.fields;
}

describe('checkRules', () => {
    it.each([
        [[{ rule: 'required' as const }], '', ['required']],
        [[{ rule: 'required' as const }], '  ', ['required']],
        [[{ rule: 'required' as const }], [], ['required']],
        [[{ rule: 'required' as const }], 0, []],
        [[{ rule: 'min' as const, value: 3 }], 'ab', ['min']],
        [[{ rule: 'min' as const, value: 3 }], 2, ['min']],
        [[{ rule: 'max' as const, value: 2 }], ['a', 'b', 'c'], ['max']],
        [[{ rule: 'pattern' as const, value: '^[a-z-]+$' }], 'Hello', ['pattern']],
        [[{ rule: 'pattern' as const, value: '^[a-z-]+$', flags: 'i' }], 'Hello', []],
        [[{ rule: 'email' as const }], 'ada@example', ['email']],
        [[{ rule: 'email' as const }], 'ada@example.com', []],
        [[{ rule: 'url' as const }], 'not a url', ['url']],
        [[{ rule: 'url' as const }], 'https://example.com', []],
        [[{ rule: 'in' as const, value: ['a', 'b'] }], 'c', ['in']],
        [[{ rule: 'in' as const, value: ['a', 'b'] }], ['a', 'b'], []],
        [[{ rule: 'accept' as const, value: ['image/*'] }], { mime: 'video/mp4' }, ['accept']],
        [[{ rule: 'accept' as const, value: ['image/*'] }], [{ mime: 'image/png' }], []],
        [[{ rule: 'maxSize' as const, value: 10 }], { size: 11 }, ['maxSize']],
        [[{ rule: 'before' as const, value: '2026-01-01' }], '2026-02-01', ['before']],
        [[{ rule: 'after' as const, value: '2026-01-01' }], '2026-02-01', []],
    ])('checks %j against %j', (rules, value, failed) => {
        expect(checkRules(rules, value).map((failure) => failure.rule)).toEqual(failed);
    });

    it('only checks other rules on filled values', () => {
        expect(checkRules([{ rule: 'min', value: 3 }, { rule: 'email' }], '')).toEqual([]);
    });

    it('compares dates with another field', () => {
        const rules = [{ rule: 'after' as const, value: { field: 'starts_at' } }];
        expect(checkRules(rules, '2026-01-01', { starts_at: '2026-02-01' })).toHaveLength(1);
        expect(checkRules(rules, '2026-03-01', { starts_at: '2026-02-01' })).toHaveLength(0);
    });

    it('keeps the parameter and message of the failed rule', () => {
        expect(checkRules([{ rule: 'max', value: 2, message: 'Too long.' }], 'abc')).toEqual([
            { rule: 'max', value: 2, message: 'Too long.' },
        ]);
    });

    it('ignores rules it does not know', () => {
        expect(checkRules([{ rule: 'luhn' }], '1234')).toEqual([]);
    });
});

describe('the crop rule', () => {
    const crop = (width: number, height: number, rotate?: 0 | 90 | 180 | 270) => ({
        id: 'med_1',
        transform: {
            crop: { x: 0, y: 0, width, height },
            ...(rotate !== undefined ? { rotate } : {}),
        },
    });
    const failed = (value: { ratios?: string[]; required?: boolean }, entry: unknown) =>
        checkRules([{ rule: 'crop', value }], entry).map((failure) => failure.rule);

    it('requires a crop for each image: an id alone, or a value without one, has none', () => {
        const required = { required: true };
        expect(failed(required, 'med_1')).toEqual(['crop']);
        expect(failed(required, { id: 'med_1', transform: { rotate: 90 } })).toEqual(['crop']);
        expect(failed(required, [crop(1600, 900), { id: 'med_2' }])).toEqual(['crop']);
        expect(failed(required, [crop(1600, 900), crop(900, 900)])).toEqual([]);
        expect(failed({}, 'med_1')).toEqual([]);
    });

    it('checks the ratio of a crop once rendered, within one pixel', () => {
        const ratios = { ratios: ['16:9', '1:1'] };
        expect(failed(ratios, crop(1600, 900))).toEqual([]);
        expect(failed(ratios, crop(1601, 900))).toEqual([]);
        expect(failed(ratios, crop(1200, 900))).toEqual(['crop']);
        // A quarter turn makes a 9:16 crop 16:9.
        expect(failed(ratios, crop(900, 1600, 90))).toEqual([]);
        expect(failed(ratios, crop(1600, 900, 90))).toEqual(['crop']);
        // Without `required`, an image without a crop passes.
        expect(failed(ratios, { id: 'med_1' })).toEqual([]);
    });

    it('keeps its parameter and message when it fails', () => {
        expect(
            checkRules(
                [{ rule: 'crop', value: { required: true }, message: 'Crop the cover.' }],
                'med_1',
            ),
        ).toEqual([{ rule: 'crop', value: { required: true }, message: 'Crop the cover.' }]);
    });
});

describe('the json rule', () => {
    it('accepts objects and arrays, and refuses text that did not parse', () => {
        const rules = [{ rule: 'json' as const }];
        expect(checkRules(rules, { a: 1 })).toEqual([]);
        expect(checkRules(rules, [1, 2])).toEqual([]);
        expect(checkRules(rules, null)).toEqual([]);
        expect(checkRules(rules, '{ "a": ')).toEqual([{ rule: 'json' }]);
        expect(checkRules(rules, 12)).toEqual([{ rule: 'json' }]);
    });

    it('applies to every json field', () => {
        const fields: Field[] = [{ name: 'data', type: 'json' }];
        expect(checkValues(fields, { data: '[1,' })).toEqual({ data: [{ rule: 'json' }] });
        expect(checkValues(fields, { data: [1] })).toEqual({});
    });
});

describe('checkValues', () => {
    it('keys failures by dot path, with locales and repeater indexes', () => {
        const failures = checkValues(
            pagesFields(),
            {
                title: { fr: 'Bonjour', en: '' },
                status: 'draft',
                blocks: [
                    { type: 'text', body: '' },
                    { type: 'image', image: { mime: 'image/png', size: 2000 } },
                ],
            },
            { locales: ['fr', 'en'] },
        );
        expect(Object.keys(failures).sort()).toEqual([
            'blocks.0.body',
            'blocks.1.image',
            'title.en',
        ]);
        expect(failures['blocks.1.image']?.map((failure) => failure.rule)).toEqual(['maxSize']);
    });

    it('accepts one filled locale when no locales are required', () => {
        expect(checkValues(pagesFields(), { title: { en: 'Hello' }, status: 'draft' })).toEqual({});
        expect(Object.keys(checkValues(pagesFields(), { title: {}, status: 'draft' }))).toEqual([
            'title',
        ]);
    });

    it('skips fields hidden by visibleWhen', () => {
        const values = { title: { fr: 'Bonjour' }, status: 'draft' };
        expect(checkValues(pagesFields(), values)).toEqual({});
        expect(Object.keys(checkValues(pagesFields(), { ...values, status: 'published' }))).toEqual(
            ['published_at'],
        );
    });

    it('only checks the values present in a partial update', () => {
        expect(checkValues(pagesFields(), { status: 'archived' }, { partial: true })).toEqual({
            status: [{ rule: 'in', value: ['draft', 'published'] }],
        });
    });

    it('skips read-only fields and fields of the other mode', () => {
        const fields: Field[] = [
            { name: 'password', type: 'text', createOnly: true, rules: [{ rule: 'required' }] },
            { name: 'reason', type: 'text', updateOnly: true, rules: [{ rule: 'required' }] },
            { name: 'computed', type: 'text', readOnly: true, rules: [{ rule: 'required' }] },
        ];
        expect(Object.keys(checkValues(fields, {}, { mode: 'create' }))).toEqual(['password']);
        expect(Object.keys(checkValues(fields, {}, { mode: 'update' }))).toEqual(['reason']);
    });

    it('checks the fields of a group', () => {
        const fields: Field[] = [
            {
                name: 'seo',
                type: 'group',
                fields: [{ name: 'title', type: 'text', rules: [{ rule: 'max', value: 3 }] }],
            },
        ];
        expect(Object.keys(checkValues(fields, { seo: { title: 'Too long' } }))).toEqual([
            'seo.title',
        ]);
    });
});
