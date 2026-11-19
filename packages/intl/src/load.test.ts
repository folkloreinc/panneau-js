import { describe, expect, it } from 'vitest';

import { fr } from './catalogs';
import { getLoadedPanneauMessages, loadPanneauMessages } from './load';

describe('loadPanneauMessages', () => {
    it('loads French on first use, then has it without loading', async () => {
        expect(getLoadedPanneauMessages('fr-CA')).toBeUndefined();
        const loading = loadPanneauMessages('fr-CA');
        // One load for every caller
        expect(loadPanneauMessages('fr')).toBe(loading);
        expect(await loading).toEqual(fr);
        expect(getLoadedPanneauMessages('fr')).toEqual(fr);
        expect(getLoadedPanneauMessages('fr-CA')).toEqual(fr);
    });

    it('has no messages to load in English or in a locale Panneau does not translate', async () => {
        expect(getLoadedPanneauMessages('en')).toEqual({});
        expect(getLoadedPanneauMessages('de-CH')).toEqual({});
        expect(await loadPanneauMessages('de')).toEqual({});
    });
});
