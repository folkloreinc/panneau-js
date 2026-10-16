import { describe, expect, it } from 'vitest';

import { getLocalizedValue, toText } from './values';

describe('values', () => {
    it('reads a localized value in the locale, its language, then the first filled one', () => {
        const value = { fr: 'Bonjour', en: '' };
        expect(getLocalizedValue(value, 'fr-CA')).toBe('Bonjour');
        expect(getLocalizedValue(value, 'en')).toBe('Bonjour');
        expect(getLocalizedValue('plain', 'en')).toBe('plain');
    });

    it('turns values into text', () => {
        expect(toText([{ id: '1', label: 'Ada' }, 'Grace', null], 'en')).toBe('Ada, Grace');
        expect(toText({ en: 'Hello' }, 'en')).toBe('Hello');
        expect(toText(42, 'en')).toBe('42');
        expect(toText(undefined, 'en')).toBe('');
    });
});
