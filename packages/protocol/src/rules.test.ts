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

    it('counts a chosen file as filled', () => {
        const file = new File(['png'], 'photo.png', { type: 'image/png' });
        expect(checkRules([{ rule: 'required' }], file)).toEqual([]);
        expect(checkRules([{ rule: 'required' }], new Blob([]))).toEqual([]);
        expect(checkRules([{ rule: 'required' }], [file])).toEqual([]);
        expect(checkRules([{ rule: 'required' }], {})).toHaveLength(1);
    });

    it('counts other collections by their length or size', () => {
        const required = [{ rule: 'required' as const }];
        expect(checkRules(required, new Map())).toHaveLength(1);
        expect(checkRules(required, new Set())).toHaveLength(1);
        expect(checkRules(required, new Set(['a']))).toEqual([]);
        // A FileList: not a plain object, with a length
        const files = Object.create({ item: () => null }, { length: { value: 0 } }) as object;
        expect(checkRules(required, files)).toHaveLength(1);
        expect(checkRules(required, new Date())).toEqual([]);
    });

    it('checks the type and size of a chosen file', () => {
        const file = new File(['12345678901'], 'clip.mp4', { type: 'video/mp4' });
        expect(
            checkRules(
                [
                    { rule: 'accept', value: ['image/*'] },
                    { rule: 'maxSize', value: 10 },
                ],
                file,
            ).map((failure) => failure.rule),
        ).toEqual(['accept', 'maxSize']);
        expect(checkRules([{ rule: 'accept', value: ['video/*'] }], [file])).toEqual([]);
    });

    it('only applies a rule limited to a mode in that mode', () => {
        const rules = [{ rule: 'required' as const, mode: 'create' as const }];
        expect(checkRules(rules, '', {}, 'create')).toHaveLength(1);
        expect(checkRules(rules, '', {}, 'update')).toEqual([]);
        expect(checkRules(rules, '')).toEqual([]);
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

describe('the tel rule', () => {
    it('accepts E.164 numbers, and refuses numbers as typed', () => {
        const rules = [{ rule: 'tel' as const }];
        expect(checkRules(rules, '+15145550199')).toEqual([]);
        expect(checkRules(rules, '+2902345')).toEqual([]);
        expect(checkRules(rules, null)).toEqual([]);
        expect(checkRules(rules, '514 555-0199')).toEqual([{ rule: 'tel' }]);
        expect(checkRules(rules, '+1 514 555 0199')).toEqual([{ rule: 'tel' }]);
        expect(checkRules(rules, '+0145550199')).toEqual([{ rule: 'tel' }]);
        expect(checkRules(rules, '+1234567890123456')).toEqual([{ rule: 'tel' }]);
    });

    it('applies to every tel field', () => {
        const fields: Field[] = [{ name: 'phone', type: 'tel' }];
        expect(checkValues(fields, { phone: '(514) 555-0199' })).toEqual({
            phone: [{ rule: 'tel' }],
        });
        expect(checkValues(fields, { phone: '+15145550199' })).toEqual({});
    });
});

describe('the postalCode rule', () => {
    it('checks the postal codes of a country, in any spacing and case', () => {
        const canada = [{ rule: 'postalCode' as const, value: 'CA' }];
        expect(checkRules(canada, 'H2X 1Y4')).toEqual([]);
        expect(checkRules(canada, 'h2x1y4')).toEqual([]);
        expect(checkRules(canada, null)).toEqual([]);
        expect(checkRules(canada, 'H2X 1Y')).toEqual([{ rule: 'postalCode', value: 'CA' }]);
        // Canada Post uses no D, F, I, O, Q or U, and no W or Z first
        expect(checkRules(canada, 'D2X 1Y4')).toEqual([{ rule: 'postalCode', value: 'CA' }]);
        const states = [{ rule: 'postalCode' as const, value: 'US' }];
        expect(checkRules(states, '12345')).toEqual([]);
        expect(checkRules(states, '12345 6789')).toEqual([]);
        expect(checkRules(states, '1234')).toEqual([{ rule: 'postalCode', value: 'US' }]);
    });

    it('passes the postal codes of other countries, and without a country', () => {
        expect(checkRules([{ rule: 'postalCode', value: 'FR' }], '75001')).toEqual([]);
        expect(checkRules([{ rule: 'postalCode' }], 'anything')).toEqual([]);
    });

    it('reads the country in another field of the form', () => {
        const fields: Field[] = [
            { name: 'country', type: 'country' },
            {
                name: 'postal',
                type: 'text',
                rules: [{ rule: 'postalCode', value: { field: 'country' } }],
            },
        ];
        expect(checkValues(fields, { country: 'CA', postal: '12345' })).toEqual({
            postal: [{ rule: 'postalCode', value: { field: 'country' } }],
        });
        expect(checkValues(fields, { country: 'US', postal: '12345' })).toEqual({});
    });
});

describe('the checks of addresses', () => {
    const fields: Field[] = [{ name: 'address', type: 'address' }];

    it('requires the street, the city and the country of a filled address', () => {
        expect(checkValues(fields, { address: null })).toEqual({});
        expect(checkValues(fields, { address: {} })).toEqual({});
        expect(checkValues(fields, { address: { postalCode: 'H2X 1Y4' } })).toEqual({
            'address.street': [{ rule: 'required' }],
            'address.city': [{ rule: 'required' }],
            'address.country': [{ rule: 'required' }],
        });
        expect(
            checkValues(fields, {
                address: { street: '1234 Rue Saint-Denis', city: 'Montréal', country: 'CA' },
            }),
        ).toEqual({});
    });

    it('requires the parts of settings.required', () => {
        const required: Field[] = [
            { name: 'address', type: 'address', settings: { required: ['city', 'postalCode'] } },
        ];
        expect(checkValues(required, { address: { city: 'Montréal' } })).toEqual({
            'address.postalCode': [{ rule: 'required' }],
        });
    });

    it('checks the postal code against the country of the address', () => {
        const address = { street: '1 Main St', city: 'Springfield', country: 'US' };
        expect(checkValues(fields, { address: { ...address, postalCode: 'H2X 1Y4' } })).toEqual({
            'address.postalCode': [{ rule: 'postalCode' }],
        });
        expect(checkValues(fields, { address: { ...address, postalCode: '12345' } })).toEqual({});
    });

    it('checks each locale of a localized address', () => {
        const localized: Field[] = [{ name: 'address', type: 'address', localized: true }];
        expect(
            checkValues(localized, {
                address: { fr: { city: 'Montréal' }, en: null },
            }),
        ).toEqual({
            'address.fr.street': [{ rule: 'required' }],
            'address.fr.country': [{ rule: 'required' }],
        });
    });
});

describe('the checks of links', () => {
    const fields: Field[] = [{ name: 'link', type: 'link', resource: 'pages' }];

    it('checks the URL of each type', () => {
        const check = (link: unknown) => checkValues(fields, { link });
        expect(check(null)).toEqual({});
        expect(check({ type: 'url', url: 'https://example.com' })).toEqual({});
        expect(check({ type: 'url', url: 'mailto:info@example.com' })).toEqual({
            'link.url': [{ rule: 'url' }],
        });
        expect(check({ type: 'url', url: '' })).toEqual({ 'link.url': [{ rule: 'required' }] });
        expect(check({ type: 'email', url: 'mailto:info@example.com?subject=Hi' })).toEqual({});
        expect(check({ type: 'email', url: 'info@example.com' })).toEqual({
            'link.url': [{ rule: 'email' }],
        });
        expect(check({ type: 'tel', url: 'tel:+15145550199' })).toEqual({});
        expect(check({ type: 'tel', url: 'tel:514-555-0199' })).toEqual({
            'link.url': [{ rule: 'tel' }],
        });
        expect(check({ type: 'page', page: { id: '12', label: 'About' } })).toEqual({});
        expect(check({ type: 'page' })).toEqual({ 'link.page': [{ rule: 'required' }] });
    });

    it('refuses a type the field does not offer', () => {
        expect(checkValues(fields, { link: { type: 'file', file: '1' } })).toEqual({
            'link.type': [{ rule: 'in', value: ['page', 'url', 'email', 'tel'] }],
        });
        const withoutPages: Field[] = [{ name: 'link', type: 'link' }];
        expect(checkValues(withoutPages, { link: { type: 'page', page: '12' } })).toEqual({
            'link.type': [{ rule: 'in', value: ['url', 'email', 'tel'] }],
        });
    });

    it('checks the types of the site against their pattern', () => {
        const anchors: Field[] = [
            {
                name: 'link',
                type: 'link',
                settings: { types: ['url', { id: 'anchor', label: 'Anchor', pattern: '^#\\w+$' }] },
            },
        ];
        expect(checkValues(anchors, { link: { type: 'anchor', url: '#program' } })).toEqual({});
        expect(checkValues(anchors, { link: { type: 'anchor', url: 'program' } })).toEqual({
            'link.url': [{ rule: 'pattern', value: '^#\\w+$' }],
        });
    });

    it('requires a label in a locale with settings.label', () => {
        const labelled: Field[] = [{ name: 'link', type: 'link', settings: { label: 'required' } }];
        const link = { type: 'url', url: 'https://example.com' };
        expect(checkValues(labelled, { link: { ...link, label: { fr: '', en: null } } })).toEqual({
            'link.label': [{ rule: 'required' }],
        });
        expect(checkValues(labelled, { link: { ...link, label: { fr: 'Billets' } } })).toEqual({});
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

    it('reads the conditions of a partial update with the values of the item', () => {
        const fields: Field[] = [
            { name: 'status', type: 'select' },
            {
                name: 'url',
                type: 'url',
                rules: [{ rule: 'required' }],
                visibleWhen: { field: 'status', equals: 'published' },
            },
        ];
        const check = (item: Record<string, unknown>) =>
            checkValues(fields, { url: '' }, { partial: true, item });
        expect(Object.keys(check({ status: 'published', url: 'https://example.com' }))).toEqual([
            'url',
        ]);
        expect(check({ status: 'draft' })).toEqual({});
        // Without the item, the values sent alone
        expect(checkValues(fields, { url: '' }, { partial: true })).toEqual({});
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

    it('applies rules limited to a mode in that mode only', () => {
        const fields: Field[] = [
            {
                name: 'password',
                type: 'text',
                rules: [
                    { rule: 'required', mode: 'create' },
                    { rule: 'min', value: 8 },
                ],
            },
            { name: 'reason', type: 'text', rules: [{ rule: 'required', mode: 'update' }] },
        ];
        expect(checkValues(fields, {}, { mode: 'create' })).toEqual({
            password: [{ rule: 'required' }],
        });
        expect(checkValues(fields, { password: '' }, { mode: 'update' })).toEqual({
            reason: [{ rule: 'required' }],
        });
        expect(checkValues(fields, { password: 'short' }, { mode: 'update' })).toMatchObject({
            password: [{ rule: 'min' }],
        });
        expect(checkValues(fields, {})).toEqual({});
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
