import { describe, expect, it } from 'vitest';

import { formatShortcut } from './shortcuts';

describe('formatShortcut', () => {
    it('writes ⌘ and its symbols on Apple platforms', () => {
        expect(formatShortcut('Mod-b', true)).toEqual({ label: '⌘B', keys: 'Meta+B' });
        expect(formatShortcut('Mod-Shift-8', true)).toEqual({
            label: '⇧⌘8',
            keys: 'Shift+Meta+8',
        });
        expect(formatShortcut('Mod-.', true)).toEqual({ label: '⌘.', keys: 'Meta+.' });
    });

    it('writes Ctrl and the names of keys elsewhere', () => {
        expect(formatShortcut('Mod-k', false)).toEqual({ label: 'Ctrl+K', keys: 'Control+K' });
        expect(formatShortcut('Shift-Mod-z', false)).toEqual({
            label: 'Ctrl+Shift+Z',
            keys: 'Control+Shift+Z',
        });
        expect(formatShortcut('Mod-,', false)).toEqual({ label: 'Ctrl+,', keys: 'Control+,' });
    });
});
