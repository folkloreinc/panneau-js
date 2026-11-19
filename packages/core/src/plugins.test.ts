import { describe, expect, it, vi } from 'vitest';

import {
    createPluginRegistry,
    definePlugin,
    getEntries,
    loadMessages,
    resolveEntry,
    resolveTheme,
} from './plugins';

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

    it('resolve every kind in one order: built-ins, plugins, then overrides', () => {
        const BuiltIn = () => null;
        const Plugin = () => null;
        const Override = () => null;
        const registry = createPluginRegistry([
            { id: 'test.base', fields: { text: Plugin, slug: Plugin } },
        ]);
        const options = {
            builtIn: { text: BuiltIn, date: BuiltIn },
            overrides: { slug: Override },
        };
        expect(resolveEntry(registry, 'fields', 'date', options)).toBe(BuiltIn);
        expect(resolveEntry(registry, 'fields', 'text', options)).toBe(Plugin);
        expect(resolveEntry(registry, 'fields', 'slug', options)).toBe(Override);
        // A map of overrides, as a component can have them
        expect(
            resolveEntry(registry, 'fields', 'text', { overrides: new Map([['text', Override]]) }),
        ).toBe(Override);
        // Not a property inherited by the record
        expect(resolveEntry(registry, 'fields', 'toString', options)).toBeUndefined();
        expect([...getEntries(registry, 'fields', options)]).toEqual([
            ['text', Plugin],
            ['date', BuiltIn],
            ['slug', Override],
        ]);
    });

    it('have every kind, with or without a plugin that gives it, and the kinds of plugins', () => {
        const Map = () => null;
        const registry = createPluginRegistry([
            { id: 'test.own', ...({ maps: { world: Map } } as object) },
        ]);
        expect(registry.previews.size).toBe(0);
        expect(registry.widgets.size).toBe(0);
        expect(
            (registry as unknown as Record<string, ReadonlyMap<string, unknown>>).maps?.get(
                'world',
            ),
        ).toBe(Map);
    });

    it('warn once in development when nothing gives an entry', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const registry = createPluginRegistry([]);
        expect(resolveEntry(registry, 'widgets', 'world-map')).toBeUndefined();
        expect(resolveEntry(registry, 'widgets', 'world-map')).toBeUndefined();
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]?.[0]).toMatch(/"widgets" for "world-map"/);
        vi.stubEnv('NODE_ENV', 'production');
        resolveEntry(registry, 'widgets', 'calendar-heatmap');
        expect(warn).toHaveBeenCalledTimes(1);
        vi.unstubAllEnvs();
        warn.mockRestore();
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
