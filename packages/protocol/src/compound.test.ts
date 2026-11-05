import { describe, expect, it } from 'vitest';

import { getNestedShape, isBuiltInFieldType, isCompoundField } from './compound';
import { checkValues } from './rules';
import type { Field } from './schemas';

const credits: Field = {
    name: 'credits',
    type: 'credits',
    multiple: true,
    fields: [
        { name: 'person', type: 'relation', resource: 'people' },
        { name: 'name', type: 'text', rules: [{ rule: 'max', value: 5 }] },
    ],
};

describe('getNestedShape', () => {
    it('gives the shape of groups and repeaters', () => {
        expect(getNestedShape({ type: 'group', fields: [] })).toBe('group');
        expect(getNestedShape({ type: 'repeater' })).toBe('repeater');
    });

    it('gives a compound field the shape of a group, or of a repeater with multiple', () => {
        expect(getNestedShape({ type: 'publication', fields: [] })).toBe('group');
        expect(getNestedShape(credits)).toBe('repeater');
    });

    it('gives none to other fields, built-in ones with fields included', () => {
        expect(getNestedShape({ type: 'text' })).toBeNull();
        expect(getNestedShape({ type: 'credits' })).toBeNull();
        expect(getNestedShape({ type: 'address', fields: [] })).toBeNull();
    });
});

describe('isCompoundField', () => {
    it('is a type that is not built in, with fields', () => {
        expect(isCompoundField(credits)).toBe(true);
        expect(isCompoundField({ type: 'credits' })).toBe(false);
        expect(isCompoundField({ type: 'group', fields: [] })).toBe(false);
        expect(isBuiltInFieldType('repeater')).toBe(true);
        expect(isBuiltInFieldType('credits')).toBe(false);
    });
});

describe('checkValues on compound fields', () => {
    it('checks the fields of each item, by path', () => {
        const failures = checkValues([credits], {
            credits: [{ name: 'Ada' }, { name: 'Ada Lovelace' }],
        });
        expect(Object.keys(failures)).toEqual(['credits.1.name']);
    });

    it('checks the fields of a compound field without multiple as a group', () => {
        const failures = checkValues([{ ...credits, multiple: false }], {
            credits: { name: 'Ada Lovelace' },
        });
        expect(Object.keys(failures)).toEqual(['credits.name']);
    });
});
