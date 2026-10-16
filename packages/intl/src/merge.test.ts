import { describe, expect, it } from 'vitest';

import { en, fr } from './catalogs';
import { getPanneauMessages, withPanneauMessages } from './merge';

describe('getPanneauMessages', () => {
    it('returns the messages of a locale, or of its language', () => {
        expect(getPanneauMessages('fr')).toBe(fr);
        expect(getPanneauMessages('fr-CA')).toBe(fr);
        expect(getPanneauMessages('en-US')).toBe(en);
    });

    it('returns no messages for a locale Panneau does not translate', () => {
        expect(getPanneauMessages('es')).toEqual({});
    });
});

describe('withPanneauMessages', () => {
    it('merges the messages of every package with the app’s, which win', () => {
        const messages = withPanneauMessages('fr', {
            'app.title': 'Mon app',
            'panneau.forms.save': 'Publier',
        });
        expect(messages['app.title']).toBe('Mon app');
        expect(messages['panneau.forms.save']).toBe('Publier');
        expect(messages['panneau.ui.close']).toBe('Fermer');
        expect(messages['panneau.fields.add']).toBe('Ajouter');
        expect(messages['panneau.forms.saved']).toBe('Enregistré');
    });

    it('works without app messages', () => {
        expect(withPanneauMessages('fr')).toEqual(fr);
    });
});
