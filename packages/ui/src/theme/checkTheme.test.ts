import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { bootstrapTheme } from './bootstrap';
import { checkTheme } from './checkTheme';

/** The tokens the default theme declares in a block of its stylesheet. */
function defaultTokens(selector: string): Record<string, string> {
    const css = readFileSync(join(import.meta.dirname, '../root/PanneauRoot.module.css'), 'utf8');
    const start = css.indexOf(selector);
    const block = css.slice(start, css.indexOf('}', start));
    return Object.fromEntries(
        [...block.matchAll(/--(panneau-color-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [
            match[1] as string,
            match[2] as string,
        ]),
    );
}

describe('checkTheme', () => {
    it('passes the colors of the default theme, the muted tone included', () => {
        const report = checkTheme({
            tokens: defaultTokens(':where(.root) {'),
            dark: defaultTokens(":where(.root[data-color-scheme='dark']"),
        });
        expect(report.failures).toEqual([]);
        expect(
            report.checks
                .filter(
                    (check) => check.name.startsWith('tokens: muted tone ') && check.ratio !== null,
                )
                .map((check) => `${check.scheme} ${check.name}`),
        ).toEqual([
            'light tokens: muted tone text on surface',
            'light tokens: muted tone border on surface',
            'light tokens: muted tone solid text on solid',
            'light tokens: muted tone solid text on hover',
            'dark tokens: muted tone text on surface',
            'dark tokens: muted tone border on surface',
            'dark tokens: muted tone solid text on solid',
            'dark tokens: muted tone solid text on hover',
        ]);
    });

    it('reports text tokens below 4.5:1', () => {
        const report = checkTheme({
            tokens: { 'panneau-color-text-muted': '#aaaaaa', 'panneau-color-surface': '#ffffff' },
        });
        expect(report.failures).toEqual([
            expect.objectContaining({
                scheme: 'light',
                name: 'tokens: muted text on surface',
                minimum: 4.5,
            }),
            expect.objectContaining({ scheme: 'dark', name: 'tokens: muted text on surface' }),
        ]);
    });

    it('passes the tones it derives', () => {
        const report = checkTheme({ tokens: {}, tones: { signal: '#f25c05', calm: '#38bdf8' } });
        expect(report.checks).toHaveLength(16);
        expect(report.failures).toEqual([]);
    });

    it('reports explicit tones that are not readable', () => {
        const report = checkTheme({
            tokens: {},
            tones: {
                pale: {
                    text: '#cccccc',
                    subtle: '#fafafa',
                    border: '#eeeeee',
                    outline: '#cccccc',
                    solid: '#eeeeee',
                    solidHover: '#dddddd',
                    solidText: '#ffffff',
                },
            },
        });
        expect(report.failures.map((check) => `${check.scheme} ${check.name}`)).toEqual([
            'light tone pale: text on surface',
            'light tone pale: text on subtle',
            'light tone pale: solid text on solid',
            'light tone pale: solid text on hover',
            'dark tone pale: text on subtle',
            'dark tone pale: solid text on solid',
            'dark tone pale: solid text on hover',
        ]);
    });

    it('checks values that refer to the palette or to other tokens', () => {
        const report = checkTheme({
            palette: { gray: '#aaaaaa' },
            tokens: {
                'panneau-color-surface': '#ffffff',
                'panneau-color-text-muted': 'var(--panneau-palette-gray)',
            },
            tones: { signal: 'var(--panneau-palette-gray)' },
        });
        expect(report.failures.map((check) => check.name)).toContain(
            'tokens: muted text on surface',
        );
        expect(report.unchecked.filter((check) => check.name.startsWith('tone'))).toEqual([]);
    });

    it('checks the values of explicit tones that refer to the palette', () => {
        const report = checkTheme({
            palette: { pale: '#ffe866' },
            tokens: { 'panneau-color-surface': '#ffffff' },
            tones: {
                pale: {
                    text: 'var(--panneau-palette-pale)',
                    subtle: '#fffbe6',
                    border: '#ffe866',
                    outline: '#000000',
                    solid: 'var(--panneau-palette-pale)',
                    solidHover: '#ffdd00',
                    solidText: '#000000',
                },
            },
        });
        expect(report.unchecked.filter((check) => check.name.startsWith('tone'))).toEqual([]);
        expect(report.failures.map((check) => `${check.scheme} ${check.name}`)).toContain(
            'light tone pale: text on surface',
        );
    });

    it('checks translucent colors as they show over the surface', () => {
        const report = checkTheme({
            tokens: {
                'panneau-color-surface': '#ffffff',
                'panneau-color-border-control': 'rgb(0 0 0 / 0.2)',
            },
        });
        const check = report.checks.find(
            (item) => item.scheme === 'light' && item.name === 'tokens: control border on surface',
        );
        // Black at 20% over white is #cccccc: 1.6:1, not the 21:1 of black.
        expect(check?.ratio).toBeCloseTo(1.6, 1);
        expect(report.failures).toContain(check);
    });

    it('checks selections, as the accent when the theme does not set them', () => {
        const yellow = {
            'panneau-color-surface': '#ffffff',
            'panneau-color-accent': '#ffdd00',
            'panneau-color-accent-text': '#000000',
        };
        expect(
            checkTheme({ tokens: yellow }).failures.map((check) => `${check.scheme} ${check.name}`),
        ).toEqual(['light tokens: selected on surface', 'dark tokens: selected on surface']);
        expect(
            checkTheme({
                tokens: {
                    ...yellow,
                    'panneau-selected-bg': '#000000',
                    'panneau-selected-text': '#ffffff',
                },
            }).failures,
        ).toEqual([]);
    });

    it('lists colors it can not read as unchecked', () => {
        const report = checkTheme(bootstrapTheme);
        expect(report.failures).toEqual([]);
        expect(report.unchecked.length).toBeGreaterThan(0);
    });
});
