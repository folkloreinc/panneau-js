import { describe, expect, it } from 'vitest';

import { cx } from './cx';

describe('cx', () => {
    it('joins class names and skips empty ones', () => {
        expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
    });

    it('drops repeated class names, which a component class and a module class can give', () => {
        expect(cx('panneau-badge', 'panneau-badge', 'project')).toBe('panneau-badge project');
        expect(cx('a b', 'b c')).toBe('a b c');
    });
});
