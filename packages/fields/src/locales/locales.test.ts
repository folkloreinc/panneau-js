import { describe, expect, it } from 'vitest';

import { en, fr } from '.';

describe('locales', () => {
    it('translates every message in French', () => {
        expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
    });

    it('has the default messages in English', () => {
        expect(en['panneau.fields.add']).toBe('Add');
    });
});
