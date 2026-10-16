import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { useFormatRuleFailure } from './formatError';

const FIELDS: Field[] = [
    { name: 'title', type: 'text' },
    { name: 'count', type: 'number' },
    { name: 'links', type: 'repeater', fields: [{ name: 'url', type: 'url' }] },
    { name: 'tags', type: 'select', multiple: true, options: [] },
];

describe('useFormatRuleFailure', () => {
    it('says characters, numbers or items from the field', () => {
        const { result } = renderHook(() => useFormatRuleFailure(FIELDS));
        const format = result.current;
        expect(format({ rule: 'max', value: 1 }, 'title')).toBe('At most 1 character.');
        expect(format({ rule: 'min', value: 3 }, 'count')).toBe('This value must be at least 3.');
        expect(format({ rule: 'min', value: 2 }, 'links')).toBe('At least 2 items.');
        expect(format({ rule: 'max', value: 2 }, 'tags')).toBe('At most 2 items.');
        expect(format({ rule: 'required' }, 'links.0.url')).toBe('This field is required.');
        expect(format({ rule: 'email' }, 'title')).toBe('This value must be an email address.');
        expect(format({ rule: 'unique' }, 'title')).toBe('This value is invalid.');
        expect(format({ rule: 'required', message: 'Custom.' }, 'title')).toBe('Custom.');
    });
});
