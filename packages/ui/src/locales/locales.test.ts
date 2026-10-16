import { describe, expect, it } from 'vitest';

import { en as allEn, fr as allFr } from '@panneau/intl';

import { en, fr } from '.';

// The checks of the translations are in `@panneau/intl`, across packages.
describe('the deprecated locales of @panneau/ui', () => {
    it('has the messages of the package, from @panneau/intl', () => {
        expect(Object.keys(en).length).toBeGreaterThan(0);
        expect(Object.keys(en).every((id) => id.startsWith('panneau.ui.'))).toBe(true);
        expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
        Object.keys(en).forEach((id) => {
            expect(en[id]).toBe(allEn[id]);
            expect(fr[id]).toBe(allFr[id]);
        });
    });
});
