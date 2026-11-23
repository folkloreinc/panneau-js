import { describe, expect, it } from 'vitest';

import { getLocalizedEntries, getLocalizedValue, toText } from './values';

describe('values', () => {
    it('lists the locales of a localized value, the locale or its language first', () => {
        const value = { en: 'Hello', fr: 'Bonjour', es: 'Hola' };
        expect(getLocalizedEntries(value, 'fr-CA', ['en', 'fr'])).toEqual([
            ['fr', 'Bonjour'],
            ['en', 'Hello'],
            ['es', 'Hola'],
        ]);
        // The locales given, even empty, then those of the value
        expect(getLocalizedEntries({ en: 'Hello' }, 'en', ['en', 'fr'])).toEqual([
            ['en', 'Hello'],
            ['fr', null],
        ]);
        expect(getLocalizedEntries({ fr: 'Bonjour', en: 'Hello' }, 'de')).toEqual([
            ['fr', 'Bonjour'],
            ['en', 'Hello'],
        ]);
        expect(getLocalizedEntries('plain', 'en', ['en'])).toEqual([]);
        expect(getLocalizedEntries(null, 'en', ['en'])).toEqual([]);
    });

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
