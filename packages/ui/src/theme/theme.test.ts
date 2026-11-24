import { describe, expect, it } from 'vitest';

import { bootstrapTheme } from './bootstrap';
import { WHITE, contrastRatio, parseColor } from './color';
import { deriveAccentStrong, getThemeCss, hashString, resolveReference } from './theme';

const ratio = (a: string, b: string) =>
    contrastRatio(parseColor(a) ?? WHITE, parseColor(b) ?? WHITE);

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
            // The accent as text is the accent itself when it is readable.
            '[data-panneau-theme="abc"]{--panneau-color-accent:#05f;--panneau-color-accent-strong:#0055ff;}' +
                '[data-panneau-theme="abc"][data-color-scheme="dark"]{--panneau-color-accent:#9cf;--panneau-color-accent-strong:#99ccff;}' +
                '@media (prefers-color-scheme: dark){[data-panneau-theme="abc"][data-color-scheme="auto"]{--panneau-color-accent:#9cf;--panneau-color-accent-strong:#99ccff;}}',
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

    it('writes the palette as variables, and derives tones from palette colors', () => {
        const css = getThemeCss(
            {
                palette: { orange: '#f25c05', 'bad name': 'red' },
                tokens: { 'panneau-color-accent': 'var(--panneau-palette-orange)' },
                tones: { signal: 'var(--panneau-palette-orange)' },
            },
            'abc',
        );
        expect(css).toContain(
            '[data-panneau-theme="abc"]{--panneau-palette-orange:#f25c05;--panneau-color-accent:var(--panneau-palette-orange);--panneau-color-accent-strong:#b84604;}',
        );
        expect(css).toContain('--panneau-tone-solid:#f25c05;');
    });

    it('writes the tokens of each density, with auto following the pointer', () => {
        const css = getThemeCss(
            {
                tokens: {},
                densities: {
                    comfortable: { 'panneau-control-height': '2.5rem' },
                    touch: { 'panneau-control-height': '3rem' },
                },
            },
            'abc',
        );
        expect(css).toBe(
            '[data-panneau-theme="abc"][data-density="comfortable"]{--panneau-control-height:2.5rem;}' +
                '@media not (pointer: coarse){[data-panneau-theme="abc"][data-density="auto"]{--panneau-control-height:2.5rem;}}' +
                '[data-panneau-theme="abc"][data-density="touch"]{--panneau-control-height:3rem;}' +
                '@media (pointer: coarse){[data-panneau-theme="abc"][data-density="auto"]{--panneau-control-height:3rem;}}',
        );
    });

    it('returns nothing for an empty theme', () => {
        expect(getThemeCss({ tokens: {} }, 'abc')).toBe('');
    });
});

describe('resolveReference', () => {
    it('follows var() references through the given variables', () => {
        const variables = {
            'panneau-palette-orange': '#f25c05',
            'panneau-color-accent': 'var(--panneau-palette-orange)',
        };
        expect(resolveReference('var(--panneau-color-accent)', variables)).toBe('#f25c05');
        expect(resolveReference('var(--bs-primary)', variables)).toBe('var(--bs-primary)');
        expect(resolveReference('var(--constructor)', variables)).toBe('var(--constructor)');
        expect(resolveReference('#000', variables)).toBe('#000');
    });

    it('stops on circular references', () => {
        expect(resolveReference('var(--a)', { a: 'var(--b)', b: 'var(--a)' })).toMatch(/^var/);
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

describe('deriveAccentStrong', () => {
    // A theme with a light accent, as a yellow brand color gives: dark text on the yellow.
    const yellow = {
        tokens: {
            'panneau-color-accent': '#ffea00',
            'panneau-color-accent-text': '#18181b',
            'panneau-color-accent-subtle': '#fffbd1',
        },
        dark: { 'panneau-color-accent-subtle': '#3a3500' },
    };

    it('makes a light accent readable as text on the backgrounds of each scheme', () => {
        const { light, dark } = deriveAccentStrong(yellow);
        ['#ffffff', '#fffbd1'].forEach((background) => {
            expect(ratio(light ?? '', background)).toBeGreaterThanOrEqual(4.5);
        });
        ['#09090b', '#18181b', '#3a3500'].forEach((background) => {
            expect(ratio(dark ?? '', background)).toBeGreaterThanOrEqual(4.5);
        });
        // In the dark scheme, the yellow is readable as it is.
        expect(dark).toBe('#ffea00');
    });

    it('follows the surfaces of the theme', () => {
        const surface = '#2b2b2b';
        const { light } = deriveAccentStrong({
            tokens: {
                'panneau-color-accent': '#3b82f6',
                'panneau-color-surface': surface,
                'panneau-color-bg': surface,
                'panneau-color-accent-subtle': '#1e3a5f',
            },
        });
        expect(ratio(light ?? '', surface)).toBeGreaterThanOrEqual(4.5);
    });

    it('keeps the value a theme sets, in the schemes it applies to', () => {
        expect(
            deriveAccentStrong({
                tokens: { 'panneau-color-accent': '#ffea00' },
                dark: { 'panneau-color-accent-strong': '#fff36b' },
            }).dark,
        ).toBeUndefined();
        expect(
            deriveAccentStrong({
                tokens: {
                    'panneau-color-accent': '#ffea00',
                    'panneau-color-accent-strong': '#5c5300',
                },
            }),
        ).toEqual({});
    });

    it('falls back to the accent when it can not read it, and derives nothing without one', () => {
        expect(deriveAccentStrong({ tokens: { 'panneau-color-accent': 'var(--brand)' } })).toEqual({
            light: 'var(--panneau-color-accent)',
            dark: 'var(--panneau-color-accent)',
        });
        expect(deriveAccentStrong({ tokens: { 'panneau-color-text': '#000' } })).toEqual({});
    });

    it('is written by getThemeCss() in each scheme where it differs', () => {
        const css = getThemeCss(yellow, 'abc');
        const { light } = deriveAccentStrong(yellow);
        expect(css).toContain(`--panneau-color-accent-strong:${light};}`);
        expect(css).toContain(
            '[data-panneau-theme="abc"][data-color-scheme="dark"]{--panneau-color-accent-subtle:#3a3500;--panneau-color-accent-strong:#ffea00;}',
        );
    });
});
