import { describe, expect, it } from 'vitest';

import { createPluginRegistry, definePlugin, loadMessages } from './plugins';

const Text = () => null;
const CustomText = () => null;
const Date = () => null;

describe('plugins', () => {
    it('merge in order, later plugins overriding earlier ones', () => {
        const registry = createPluginRegistry([
            definePlugin({
                id: 'base',
                fields: { text: Text },
                displays: { date: Date },
                themes: { default: { tokens: { 'panneau-color-accent': 'blue' } } },
            }),
            definePlugin({
                id: 'project',
                fields: { text: CustomText },
                themes: { default: { tokens: { 'panneau-color-accent': 'red' } } },
            }),
        ]);
        expect(registry.fields.get('text')).toBe(CustomText);
        expect(registry.displays.get('date')).toBe(Date);
        expect(registry.pages.size).toBe(0);
        expect(registry.themes.get('default')?.tokens['panneau-color-accent']).toBe('red');
        expect(registry.plugins.map((plugin) => plugin.id)).toEqual(['base', 'project']);
    });

    it('need unique ids', () => {
        expect(() => createPluginRegistry([{ id: 'a' }, { id: 'a' }])).toThrow(/a/);
    });

    it('load and merge the messages of a locale', async () => {
        const registry = createPluginRegistry([
            { id: 'base', locales: { fr: { save: 'Enregistrer', cancel: 'Annuler' } } },
            {
                id: 'project',
                locales: {
                    fr: async () => ({ default: { save: 'Sauvegarder' } }),
                    'fr-CA': async () => ({ cancel: 'Canceller' }),
                },
            },
        ]);
        expect(await loadMessages(registry, 'fr')).toEqual({
            save: 'Sauvegarder',
            cancel: 'Annuler',
        });
        expect(await loadMessages(registry, 'fr-CA')).toEqual({
            save: 'Sauvegarder',
            cancel: 'Canceller',
        });
        expect(await loadMessages(registry, 'de')).toEqual({});
    });
});
