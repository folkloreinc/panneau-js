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
