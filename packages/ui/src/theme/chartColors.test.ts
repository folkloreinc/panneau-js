import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { chartColors } from './chartColors';
import { checkTheme } from './checkTheme';
import { contrastRatio, luminance, parseColor } from './color';
import { checkColorDifferences, colorDifference, simulateColorVision } from './colorVision';

const css = readFileSync(join(import.meta.dirname, '../root/PanneauRoot.module.css'), 'utf8');

function declarations(selector: string): Record<string, string> {
    const start = css.indexOf(`${selector} {`);
    const block = css.slice(start, css.indexOf('\n}', start));
    return Object.fromEntries(
        [...block.matchAll(/--(panneau-[a-z0-9-]+):\s*([^;]+);/g)].map((match) => [
            match[1] ?? '',
            match[2] ?? '',
        ]),
    );
}

const light = declarations(':where(.root)');
const schemes = {
    light,
    dark: {
        ...light,
        ...declarations(
            ":where(.root[data-color-scheme='dark'], .scheme[data-color-scheme='dark'])",
        ),
    },
};

const rgb = (value: string | undefined) => {
    const color = parseColor(value ?? '');
    if (color === null) {
        throw new Error(`Not a color: ${String(value)}`);
    }
    return color;
};

describe.each(Object.entries(schemes))('chart colors of the %s scheme', (_, tokens) => {
    const surface = rgb(tokens['panneau-color-surface']);
    const categorical = Array.from(
        { length: 8 },
        (__, index) => tokens[`panneau-chart-categorical-${index + 1}`] ?? '',
    );

    it('reach 3:1 against the surface', () => {
        [
            ...categorical,
            tokens['panneau-chart-sequential-5'],
            tokens['panneau-chart-diverging-negative'],
            tokens['panneau-chart-diverging-positive'],
        ].forEach((color) => {
            expect(contrastRatio(rgb(color), surface), color).toBeGreaterThanOrEqual(3);
        });
    });

    it('stay distinct with color vision deficiencies', () => {
        expect(checkColorDifferences(categorical, 12)).toEqual([]);
        expect(
            checkColorDifferences(
                [
                    tokens['panneau-chart-diverging-negative'] ?? '',
                    tokens['panneau-chart-diverging-positive'] ?? '',
                ],
                40,
            ),
        ).toEqual([]);
    });

    it('have a sequential ramp that moves away from the surface', () => {
        const contrasts = Array.from({ length: 5 }, (__, index) =>
            contrastRatio(rgb(tokens[`panneau-chart-sequential-${index + 1}`]), surface),
        );
        expect([...contrasts].sort((a, b) => a - b)).toEqual(contrasts);
    });
});

describe('chartColors', () => {
    it('are CSS variables, with categorical colors repeating in order', () => {
        expect(chartColors.categorical(0)).toBe('var(--panneau-chart-categorical-1)');
        expect(chartColors.categorical(9)).toBe('var(--panneau-chart-categorical-2)');
        expect(chartColors.categorical(-1)).toBe('var(--panneau-chart-categorical-8)');
        expect(chartColors.sequential(5)).toBe('var(--panneau-chart-sequential-5)');
        expect(chartColors.diverging.positive).toBe('var(--panneau-chart-diverging-positive)');
    });
});

describe('color vision', () => {
    it('simulates deficiencies', () => {
        const red = { r: 255, g: 0, b: 0 };
        // Red looks much darker to red-blind people.
        expect(luminance(simulateColorVision(red, 'protanopia'))).toBeLessThan(luminance(red));
        expect(colorDifference({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(
            100,
            0,
        );
    });

    it('reports colors that look alike with a deficiency', () => {
        // Red and green of the same lightness, the classic confusion.
        const pairs = checkColorDifferences(['#d0473a', '#5f8f2f'], 20);
        expect(pairs.map((pair) => pair.vision)).toContain('deuteranopia');
        expect(pairs.map((pair) => pair.vision)).not.toContain('typical');
    });
});

describe('checkTheme', () => {
    it('checks the chart colors a theme sets', () => {
        const report = checkTheme({
            tokens: {
                'panneau-chart-categorical-1': '#d0473a',
                'panneau-chart-categorical-2': '#5f8f2f',
                'panneau-chart-categorical-3': '#fde68a',
            },
        });
        expect(report.failures.map((check) => check.name)).toContain(
            'chart: categorical-3 on surface',
        );
        expect(report.colorDifferences.some((check) => check.vision === 'deuteranopia')).toBe(true);
    });
});
