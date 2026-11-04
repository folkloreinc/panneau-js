import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { useFormatRuleFailure } from './formatError';

const FIELDS: Field[] = [
    { name: 'title', type: 'text' },
    { name: 'count', type: 'number' },
    { name: 'links', type: 'repeater', fields: [{ name: 'url', type: 'url' }] },
    { name: 'tags', type: 'select', multiple: true, options: [] },
    { name: 'countries', type: 'country', multiple: true },
    { name: 'video', type: 'embed' },
    { name: 'price', type: 'money', settings: { currency: 'CAD' } },
    { name: 'dates', type: 'daterange' },
];

describe('useFormatRuleFailure', () => {
    it('says characters, numbers or items from the field', () => {
        const { result } = renderHook(() => useFormatRuleFailure(FIELDS));
        const format = result.current;
        expect(format({ rule: 'max', value: 1 }, 'title')).toBe('At most 1 character.');
        expect(format({ rule: 'min', value: 3 }, 'count')).toBe('This value must be at least 3.');
        expect(format({ rule: 'min', value: 2 }, 'links')).toBe('At least 2 items.');
        expect(format({ rule: 'max', value: 2 }, 'tags')).toBe('At most 2 items.');
        expect(format({ rule: 'min', value: 2 }, 'countries')).toBe('At least 2 items.');
        expect(format({ rule: 'required' }, 'links.0.url')).toBe('This field is required.');
        expect(format({ rule: 'email' }, 'title')).toBe('This value must be an email address.');
        expect(format({ rule: 'unique' }, 'title')).toBe('This value is invalid.');
        expect(format({ rule: 'required', message: 'Custom.' }, 'title')).toBe('Custom.');
    });

    it('names the ratios of a crop', () => {
        const { result } = renderHook(() => useFormatRuleFailure(FIELDS));
        const format = result.current;
        expect(format({ rule: 'crop', value: { ratios: ['16:9', '1:1'] } }, 'title')).toBe(
            'Crop the image to 16:9 or 1:1.',
        );
        expect(format({ rule: 'crop', value: { required: true } }, 'title')).toBe(
            'Crop the image for this use.',
        );
    });

    it('names the providers of an embed', () => {
        const { result } = renderHook(() => useFormatRuleFailure(FIELDS));
        expect(result.current({ rule: 'providers', value: ['YouTube', 'Vimeo'] }, 'video')).toBe(
            'This embed must come from YouTube or Vimeo.',
        );
    });

    it('formats the amounts of money, and says what a date range misses', () => {
        const { result } = renderHook(() => useFormatRuleFailure(FIELDS));
        const format = result.current;
        expect(format({ rule: 'min', value: 100 }, 'price')).toBe(
            'This amount must be at least CA$1.00.',
        );
        expect(format({ rule: 'max', value: 1250 }, 'price')).toBe(
            'This amount must be at most CA$12.50.',
        );
        expect(format({ rule: 'daterange', value: 'end' }, 'dates')).toBe(
            'Give the end of this range.',
        );
        expect(format({ rule: 'daterange', value: 'order' }, 'dates')).toBe(
            'The end can’t be before the start.',
        );
        expect(format({ rule: 'money' }, 'price')).toBe(
            'This value must be an amount in one of the allowed currencies.',
        );
    });
});
