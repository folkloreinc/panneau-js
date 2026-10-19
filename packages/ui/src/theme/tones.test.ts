import { describe, expect, it } from 'vitest';

import { WHITE, contrastRatio, parseColor } from './color';
import { deriveTone, resolveTone } from './tones';

const ratio = (a: string, b: string) =>
    contrastRatio(parseColor(a) ?? WHITE, parseColor(b) ?? WHITE);

describe('deriveTone', () => {
    it('derives readable values in both schemes from one color', () => {
        const { light, dark } = deriveTone('#f25c05');
        expect(light.solid).toBe('#f25c05');
        expect(ratio(light.solidText, light.solid)).toBeGreaterThanOrEqual(4.5);
        expect(ratio(light.solidText, light.solidHover)).toBeGreaterThanOrEqual(
            ratio(light.solidText, light.solid),
        );
        expect(ratio(light.text, '#ffffff')).toBeGreaterThanOrEqual(4.5);
        expect(ratio(dark.text, '#18181b')).toBeGreaterThanOrEqual(4.5);
        // On the tinted subtle backgrounds too (12% and 22% of the color, as axe measured them).
        expect(ratio(light.text, '#fdebe1')).toBeGreaterThanOrEqual(4.5);
        expect(ratio(dark.text, '#482716')).toBeGreaterThanOrEqual(4.5);
        expect(light.subtle).toBe('color-mix(in srgb, #f25c05 12%, var(--panneau-color-surface))');
    });

    it('uses black text on a light color', () => {
        expect(deriveTone('#facc15').light.solidText).toBe('#000000');
    });

    it('uses a color it can not read as is', () => {
        const { light } = deriveTone('var(--bs-primary)');
        expect(light.solid).toBe('var(--bs-primary)');
        expect(light.text).toBe('var(--bs-primary)');
        expect(light.solidHover).toBe('color-mix(in srgb, var(--bs-primary), #000 15%)');
    });
});

describe('resolveTone', () => {
    it('keeps explicit values, with dark overrides', () => {
        const values = {
            text: '#2f5d46',
            subtle: '#e3ede5',
            border: '#9cc3a8',
            outline: '#2f5d46',
            solid: '#2f5d46',
            solidHover: '#244a37',
            solidText: '#ffffff',
        };
        const resolved = resolveTone({ ...values, dark: { text: '#a7d3b8' } });
        expect(resolved.light).toEqual(values);
        expect(resolved.dark).toEqual({ ...values, text: '#a7d3b8' });
    });
});
