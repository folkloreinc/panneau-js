import { describe, expect, it } from 'vitest';

import { bootstrapTheme } from './bootstrap';
import { getThemeCss, hashString } from './theme';

describe('getThemeCss', () => {
    it('scopes the tokens of a theme, with dark overrides', () => {
        const css = getThemeCss(
            {
                tokens: { 'panneau-color-accent': '#05f' },
                dark: { 'panneau-color-accent': '#9cf' },
            },
            'abc',
        );
        expect(css).toBe(
            '[data-panneau-theme="abc"]{--panneau-color-accent:#05f;}' +
                '[data-panneau-theme="abc"][data-color-scheme="dark"]{--panneau-color-accent:#9cf;}' +
                '@media (prefers-color-scheme: dark){[data-panneau-theme="abc"][data-color-scheme="auto"]{--panneau-color-accent:#9cf;}}',
        );
    });

    it('ignores token names and values that could break out of the rule', () => {
        const css = getThemeCss(
            {
                tokens: {
                    'panneau-color-accent': 'red}body{color:red',
                    'bad name': 'red',
                    'panneau-color-text': '#000',
                },
            },
            'abc',
        );
        expect(css).toBe('[data-panneau-theme="abc"]{--panneau-color-text:#000;}');
    });

    it('writes the tones of a theme, in both schemes', () => {
        const css = getThemeCss(
            { tokens: {}, tones: { signal: '#f25c05', 'bad name': 'red' } },
            'abc',
        );
        expect(css).toContain(
            '[data-panneau-theme="abc"] .panneau-tone-signal{--panneau-tone-text:',
        );
        expect(css).toContain(
            '[data-panneau-theme="abc"][data-color-scheme="dark"] .panneau-tone-signal{',
        );
        expect(css).toContain(
            '@media (prefers-color-scheme: dark){[data-panneau-theme="abc"][data-color-scheme="auto"] .panneau-tone-signal{',
        );
        expect(css).toContain('--panneau-tone-solid:#f25c05;');
        expect(css).not.toContain('bad name');
    });

    it('writes the named variants of components', () => {
        const css = getThemeCss(
            {
                tokens: {},
                components: {
                    badge: {
                        variants: { tag: { 'panneau-badge-radius': 'var(--panneau-radius-sm)' } },
                    },
                },
            },
            'abc',
        );
        expect(css).toBe(
            '[data-panneau-theme="abc"] .panneau-badge-variant-tag{--panneau-badge-radius:var(--panneau-radius-sm);}',
        );
    });

    it('returns nothing for an empty theme', () => {
        expect(getThemeCss({ tokens: {} }, 'abc')).toBe('');
    });
});

describe('hashString', () => {
    it('is stable and short', () => {
        expect(hashString('a')).toBe(hashString('a'));
        expect(hashString('a')).not.toBe(hashString('b'));
    });
});

describe('bootstrapTheme', () => {
    it('maps tokens to Bootstrap variables', () => {
        expect(bootstrapTheme.tokens['panneau-color-accent']).toBe('var(--bs-primary)');
        expect(bootstrapTheme.dark).toBeUndefined();
    });
});
