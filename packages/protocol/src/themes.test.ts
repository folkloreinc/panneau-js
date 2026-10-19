import { describe, expect, it } from 'vitest';

import { DefinitionTheme, Theme } from './schemas/theme';
import { mergeThemes } from './themes';

describe('Theme', () => {
    it('accepts a theme with every part', () => {
        const theme = {
            label: 'Brand',
            tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
            dark: { 'panneau-color-accent': '#ffb38a' },
            palette: { orange: '#f25c05' },
            tones: {
                signal: '#f25c05',
                members: {
                    text: '#5b21b6',
                    subtle: '#f5f3ff',
                    border: '#c4b5fd',
                    outline: '#5b21b6',
                    solid: '#6d28d9',
                    solidHover: '#5b21b6',
                    solidText: '#ffffff',
                    dark: { text: '#c4b5fd' },
                },
            },
            components: { badge: { variants: { tag: { 'panneau-badge-radius': '0' } } } },
        };
        expect(Theme.safeParse(theme).success).toBe(true);
    });

    it('refuses values and names that would break out of the CSS', () => {
        expect(Theme.safeParse({ tokens: { 'panneau-color-text': 'red}body{' } }).success).toBe(
            false,
        );
        expect(Theme.safeParse({ tokens: { 'bad name': 'red' } }).success).toBe(false);
        expect(Theme.safeParse({ tokens: {}, tones: { Signal: 'red' } }).success).toBe(false);
    });

    it('accepts fonts, and refuses font faces that would break out of the rule', () => {
        const fonts = [
            { family: 'Geist', src: 'url(data:font/woff2;base64,AAAA)', display: 'swap' },
            { stylesheet: 'https://fonts.example.com/inter.css' },
        ];
        expect(Theme.safeParse({ tokens: {}, fonts }).success).toBe(true);
        expect(
            Theme.safeParse({ tokens: {}, fonts: [{ family: 'A"}', src: 'local(a)' }] }).success,
        ).toBe(false);
    });

    it('accepts the tokens of each density, and a density in the definition', () => {
        expect(
            Theme.safeParse({
                tokens: {},
                densities: { compact: { 'panneau-control-height': '2rem' } },
            }).success,
        ).toBe(true);
        expect(DefinitionTheme.safeParse({ density: 'compact' }).success).toBe(true);
        expect(DefinitionTheme.safeParse({ density: 'dense' }).success).toBe(false);
    });

    it('lets the theme of a definition extend themes of plugins, without its own tokens', () => {
        const result = DefinitionTheme.safeParse({ colorScheme: 'auto', extends: ['brand'] });
        expect(result.success).toBe(true);
    });
});

describe('mergeThemes', () => {
    it('lets later themes override earlier ones', () => {
        const theme = mergeThemes(
            {
                label: 'Base',
                tokens: { 'panneau-color-accent': '#000', 'panneau-radius-md': '4px' },
                palette: { orange: '#f25c05', blue: '#05f' },
                tones: { signal: '#f25c05' },
            },
            {
                tokens: { 'panneau-color-accent': '#05f' },
                palette: { orange: '#ff7a1a' },
                tones: { signal: '#ff7a1a', news: '#05f' },
            },
        );
        expect(theme).toEqual({
            label: 'Base',
            tokens: { 'panneau-color-accent': '#05f', 'panneau-radius-md': '4px' },
            palette: { orange: '#ff7a1a', blue: '#05f' },
            tones: { signal: '#ff7a1a', news: '#05f' },
        });
    });

    it('drops the dark value of a token that a later theme sets for both schemes', () => {
        const theme = mergeThemes(
            {
                tokens: { 'panneau-color-accent': '#000', 'panneau-color-text': '#111' },
                dark: { 'panneau-color-accent': '#fff', 'panneau-color-text': '#eee' },
            },
            { tokens: { 'panneau-color-accent': '#05f' } },
        );
        expect(theme.dark).toEqual({ 'panneau-color-text': '#eee' });
        expect(mergeThemes(theme, { tokens: { 'panneau-color-text': '#000' } })).not.toHaveProperty(
            'dark',
        );
    });

    it('merges the variants of components token by token', () => {
        const theme = mergeThemes(
            {
                tokens: {},
                components: {
                    badge: {
                        variants: {
                            tag: { 'panneau-badge-radius': '0', 'panneau-badge-bg': '#eee' },
                        },
                    },
                },
            },
            {
                components: {
                    badge: { variants: { tag: { 'panneau-badge-bg': '#ddd' } } },
                    button: { variants: { cta: { 'panneau-button-radius': '99px' } } },
                },
            },
        );
        expect(theme.components).toEqual({
            badge: {
                variants: { tag: { 'panneau-badge-radius': '0', 'panneau-badge-bg': '#ddd' } },
            },
            button: { variants: { cta: { 'panneau-button-radius': '99px' } } },
        });
    });

    it('adds up fonts, once each', () => {
        const geist = { family: 'Geist', src: 'local(Geist)' };
        const inter = { stylesheet: 'https://fonts.example.com/inter.css' };
        expect(mergeThemes({ fonts: [geist] }, { fonts: [{ ...geist }, inter] }).fonts).toEqual([
            geist,
            inter,
        ]);
    });

    it('merges densities token by token', () => {
        const theme = mergeThemes(
            { densities: { compact: { 'panneau-control-height': '1.75rem' } } },
            {
                densities: {
                    compact: { 'panneau-row-padding-y': '0.125rem' },
                    touch: { 'panneau-control-height': '3rem' },
                },
            },
        );
        expect(theme.densities).toEqual({
            compact: { 'panneau-control-height': '1.75rem', 'panneau-row-padding-y': '0.125rem' },
            touch: { 'panneau-control-height': '3rem' },
        });
    });

    it('returns an empty theme without themes', () => {
        expect(mergeThemes()).toEqual({ tokens: {} });
    });
});
