import { describe, expect, it } from 'vitest';

import { formatShortcut, isSingleKey, matchesKeys } from './keys';

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    return new KeyboardEvent('keydown', { key, ...init });
}

describe('formatShortcut', () => {
    it('writes ⌘ and its symbols on Apple platforms', () => {
        expect(formatShortcut('Mod+b', { apple: true })).toEqual({
            labels: ['⌘B'],
            keys: 'Meta+B',
        });
        expect(formatShortcut('Mod+Shift+8', { apple: true })).toEqual({
            labels: ['⇧⌘8'],
            keys: 'Shift+Meta+8',
        });
        expect(formatShortcut('Mod+.', { apple: true })).toEqual({
            labels: ['⌘.'],
            keys: 'Meta+.',
        });
        expect(formatShortcut(['Mod+S', 'Mod+Enter'], { apple: true })).toEqual({
            labels: ['⌘S', '⌘↩'],
            keys: 'Meta+S Meta+Enter',
        });
    });

    it('writes Ctrl and the names of keys elsewhere', () => {
        expect(formatShortcut('Mod+k', { apple: false })).toEqual({
            labels: ['Ctrl+K'],
            keys: 'Control+K',
        });
        expect(formatShortcut('Shift+Mod+z', { apple: false })).toEqual({
            labels: ['Ctrl+Shift+Z'],
            keys: 'Control+Shift+Z',
        });
        expect(formatShortcut('Mod+,', { apple: false })).toEqual({
            labels: ['Ctrl+,'],
            keys: 'Control+,',
        });
        expect(
            formatShortcut(['Mod+S', 'Mod+Enter'], { apple: false, names: { Enter: 'Entrée' } }),
        ).toEqual({ labels: ['Ctrl+S', 'Ctrl+Entrée'], keys: 'Control+S Control+Enter' });
    });

    it('takes keys per platform', () => {
        const keys = { apple: 'Meta+Alt+P', other: 'Control+Alt+P' };
        expect(formatShortcut(keys, { apple: true }).labels).toEqual(['⌥⌘P']);
        expect(formatShortcut(keys, { apple: false }).labels).toEqual(['Ctrl+Alt+P']);
        expect(formatShortcut('?', { apple: false })).toEqual({ labels: ['?'], keys: '?' });
    });
});

describe('matchesKeys', () => {
    it('reads Mod as ⌘ on Apple platforms and Ctrl elsewhere', () => {
        expect(matchesKeys(press('k', { metaKey: true }), 'Mod+K', true)).toBe(true);
        expect(matchesKeys(press('k', { ctrlKey: true }), 'Mod+K', true)).toBe(false);
        expect(matchesKeys(press('k', { ctrlKey: true }), 'Mod+K', false)).toBe(true);
        expect(matchesKeys(press('k', { ctrlKey: true, shiftKey: true }), 'Mod+K', false)).toBe(
            false,
        );
        expect(matchesKeys(press('Enter', { ctrlKey: true }), ['Mod+S', 'Mod+Enter'], false)).toBe(
            true,
        );
    });

    it('matches a symbol whatever Shift it takes, and a letter by its code', () => {
        expect(matchesKeys(press('?', { shiftKey: true }), '?', false)).toBe(true);
        expect(matchesKeys(press('/'), '?', false)).toBe(false);
        // ⌥⌘P types π
        expect(
            matchesKeys(
                press('π', { code: 'KeyP', metaKey: true, altKey: true }),
                'Mod+Alt+P',
                true,
            ),
        ).toBe(true);
        expect(matchesKeys(press('j'), 'j', false)).toBe(true);
        expect(matchesKeys(press('J', { shiftKey: true }), 'j', false)).toBe(false);
    });

    it('tells single keys from combinations', () => {
        expect(isSingleKey('?')).toBe(true);
        expect(isSingleKey('Shift+J')).toBe(true);
        expect(isSingleKey('Mod+K')).toBe(false);
        expect(isSingleKey('Alt+1')).toBe(false);
    });
});
