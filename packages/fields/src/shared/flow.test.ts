import { describe, expect, it } from 'vitest';

import { isWideField } from './flow';

describe('isWideField', () => {
    it('keeps short inputs in columns, and gives long ones a row', () => {
        expect(isWideField({ name: 'title', type: 'text' })).toBe(false);
        expect(isWideField({ name: 'quantity', type: 'number' })).toBe(false);
        expect(isWideField({ name: 'status', type: 'select' })).toBe(false);
        expect(isWideField({ name: 'summary', type: 'textarea' })).toBe(true);
        expect(isWideField({ name: 'contact', type: 'group' })).toBe(true);
        // The types of plugins, such as rich text
        expect(isWideField({ name: 'body', type: 'richtext' })).toBe(true);
    });

    it('gives a row to several values, a value per locale, and radios', () => {
        expect(isWideField({ name: 'title', type: 'text', localized: true })).toBe(true);
        expect(isWideField({ name: 'tags', type: 'select', multiple: true })).toBe(true);
        expect(isWideField({ name: 'size', type: 'select', settings: { widget: 'radios' } })).toBe(
            true,
        );
    });
});
