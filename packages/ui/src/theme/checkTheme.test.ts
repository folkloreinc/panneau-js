import { describe, expect, it } from 'vitest';

import { bootstrapTheme } from './bootstrap';
import { checkTheme } from './checkTheme';

describe('checkTheme', () => {
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

    it('lists colors it can not read as unchecked', () => {
        const report = checkTheme(bootstrapTheme);
        expect(report.failures).toEqual([]);
        expect(report.unchecked.length).toBeGreaterThan(0);
    });
});
