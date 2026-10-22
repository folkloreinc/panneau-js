import { describe, expect, it, vi } from 'vitest';

import { createPluginRegistry, definePlugin, loadMessages, resolveTheme } from './plugins';

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

    it('register previews of items, by name', () => {
        const PagePreview = () => null;
        const registry = createPluginRegistry([{ id: 'site', previews: { page: PagePreview } }]);
        expect(registry.previews.get('page')).toBe(PagePreview);
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

describe('resolveTheme', () => {
    const registry = createPluginRegistry([
        definePlugin({
            id: 'brand',
            themes: {
                brand: {
                    label: 'Brand',
                    tokens: { 'panneau-color-accent': '#f25c05', 'panneau-radius-md': '0' },
                    tones: { signal: '#f25c05' },
                },
                compact: { tokens: { 'panneau-control-height': '2rem' } },
            },
        }),
    ]);

    it('merges the extended themes of plugins, then the theme of the definition', () => {
        const theme = resolveTheme(
            {
                colorScheme: 'auto',
                extends: ['brand', 'compact'],
                tokens: { 'panneau-color-accent': '#05f' },
            },
            registry.themes,
        );
        expect(theme).toEqual({
            label: 'Brand',
            tokens: {
                'panneau-color-accent': '#05f',
                'panneau-radius-md': '0',
                'panneau-control-height': '2rem',
            },
            tones: { signal: '#f25c05' },
        });
    });

    it('skips themes no plugin registers, with a warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(resolveTheme({ extends: 'missing' }, registry.themes)).toEqual({ tokens: {} });
        expect(warn).toHaveBeenCalledWith('[panneau] No plugin registers the theme "missing".');
        warn.mockRestore();
    });

    it('is empty without a theme in the definition', () => {
        expect(resolveTheme(undefined, registry.themes)).toEqual({ tokens: {} });
    });
});
