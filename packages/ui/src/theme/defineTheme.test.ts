import { afterEach, describe, expect, it, vi } from 'vitest';

import { bootstrapTheme } from './bootstrap';
import { defineTheme, findUnknownTokens, mergeThemes } from './defineTheme';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('defineTheme', () => {
    it('returns a plain theme', () => {
        const theme = defineTheme({
            label: 'Brand',
            palette: { orange: '#f25c05' },
            tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
            tones: { signal: 'var(--panneau-palette-orange)' },
        });
        expect(theme).toEqual({
            label: 'Brand',
            palette: { orange: '#f25c05' },
            tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
            tones: { signal: 'var(--panneau-palette-orange)' },
        });
    });

    it('builds on the themes it extends, in order', () => {
        const brand = defineTheme({
            label: 'Brand',
            tokens: { 'panneau-color-accent': '#f25c05', 'panneau-radius-md': '0' },
            dark: { 'panneau-color-accent': '#ffb38a' },
        });
        const compact = defineTheme({ tokens: { 'panneau-control-height': '2rem' } });
        const theme = defineTheme({
            extends: [brand, compact],
            label: 'Brand, compact',
            tokens: { 'panneau-color-accent': '#05f' },
        });
        expect(theme).toEqual({
            label: 'Brand, compact',
            tokens: {
                'panneau-color-accent': '#05f',
                'panneau-radius-md': '0',
                'panneau-control-height': '2rem',
            },
        });
        expect(defineTheme({ extends: bootstrapTheme }).tokens).toEqual(bootstrapTheme.tokens);
    });

    it('checks the names of tokens', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        defineTheme({
            tokens: {
                'panneau-color-text': '#000',
                'panneau-button-radius': '0',
                'panneau-palette-anything': '#000',
                // @ts-expect-error -- a typo of panneau-color-text
                'panneau-colour-text': '#000',
            },
        });
        defineTheme({
            components: {
                // @ts-expect-error -- Badge has no such token
                badge: { variants: { tag: { 'panneau-badge-radiuss': '0' } } },
            },
        });
    });

    it('reports unknown tokens in the console', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        defineTheme({
            label: 'Typos',
            // A theme read from JSON isn't checked by TypeScript.
            tokens: JSON.parse(
                '{"panneau-color-txt":"#000","panneau-button-radius":"0","panneau-map-pin":"red"}',
            ) as Record<string, string>,
        });
        expect(warn).toHaveBeenCalledWith(
            '[panneau] Unknown tokens in theme "Typos": panneau-color-txt.',
        );
    });
});

describe('findUnknownTokens', () => {
    it('lists unknown tokens in the namespaces of Panneau, in tokens, dark and variants', () => {
        expect(
            findUnknownTokens({
                tokens: { 'panneau-space-7': '1.75rem', 'my-token': '1px' },
                dark: { 'panneau-tone-text': '#fff' },
                components: { badge: { variants: { tag: { 'panneau-badge-colour': 'red' } } } },
            }),
        ).toEqual(['panneau-space-7', 'panneau-tone-text', 'panneau-badge-colour']);
    });

    it('accepts the tokens of the Bootstrap theme', () => {
        expect(findUnknownTokens(bootstrapTheme)).toEqual([]);
    });
});

describe('mergeThemes', () => {
    it('drops the dark value of a token that a later theme sets for both schemes', () => {
        const theme = mergeThemes(
            {
                tokens: { 'panneau-color-accent': '#000', 'panneau-color-text': '#111' },
                dark: { 'panneau-color-accent': '#fff', 'panneau-color-text': '#eee' },
            },
            { tokens: { 'panneau-color-accent': '#05f' } },
        );
        expect(theme.dark).toEqual({ 'panneau-color-text': '#eee' });
    });

    it('merges palettes, replaces tones and merges variants token by token', () => {
        const theme = mergeThemes(
            {
                tokens: {},
                palette: { orange: '#f25c05', blue: '#05f' },
                tones: { signal: '#f25c05' },
                components: {
                    badge: {
                        variants: {
                            tag: { 'panneau-badge-radius': '0', 'panneau-badge-gap': '0' },
                        },
                    },
                },
            },
            {
                palette: { orange: '#ff7a1a' },
                tones: { signal: '#ff7a1a' },
                components: { badge: { variants: { tag: { 'panneau-badge-gap': '2px' } } } },
            },
        );
        expect(theme).toEqual({
            tokens: {},
            palette: { orange: '#ff7a1a', blue: '#05f' },
            tones: { signal: '#ff7a1a' },
            components: {
                badge: {
                    variants: { tag: { 'panneau-badge-radius': '0', 'panneau-badge-gap': '2px' } },
                },
            },
        });
    });
});
