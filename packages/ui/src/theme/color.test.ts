import { describe, expect, it } from 'vitest';

import {
    BLACK,
    WHITE,
    contrastRatio,
    ensureContrast,
    parseColor,
    parseColorOver,
    parseColorWithAlpha,
    readableTextColor,
    toHex,
} from './color';

describe('colors', () => {
    it('reads hex and rgb() colors, and nothing else', () => {
        expect(parseColor('#05f')).toEqual({ r: 0, g: 85, b: 255 });
        expect(parseColor('#f25c05')).toEqual({ r: 242, g: 92, b: 5 });
        expect(parseColor('rgb(10 20 30 / 0.5)')).toEqual({ r: 10, g: 20, b: 30 });
        expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30 });
        expect(parseColor('var(--bs-primary)')).toBeNull();
        expect(parseColor('tomato')).toBeNull();
    });

    it('computes WCAG contrast ratios', () => {
        expect(contrastRatio(WHITE, BLACK)).toBe(21);
        expect(contrastRatio(WHITE, WHITE)).toBe(1);
        expect(contrastRatio(parseColor('#767676') ?? WHITE, WHITE)).toBeCloseTo(4.54, 2);
    });

    it('darkens or lightens a color until it reaches a ratio', () => {
        const orange = parseColor('#f25c05') ?? WHITE;
        expect(contrastRatio(orange, WHITE)).toBeLessThan(4.5);
        expect(contrastRatio(ensureContrast(orange, WHITE, 4.5), WHITE)).toBeGreaterThanOrEqual(
            4.5,
        );
        const dark = { r: 24, g: 24, b: 27 };
        const blue = parseColor('#1d4ed8') ?? WHITE;
        expect(contrastRatio(ensureContrast(blue, dark, 4.5), dark)).toBeGreaterThanOrEqual(4.5);
        expect(toHex(ensureContrast(WHITE, BLACK, 4.5))).toBe('#ffffff');
    });

    it('picks white or black text, whichever reads better', () => {
        expect(readableTextColor(parseColor('#1d4ed8') ?? WHITE)).toEqual(WHITE);
        expect(readableTextColor(parseColor('#facc15') ?? WHITE)).toEqual(BLACK);
    });

    it('reads the opacity of a color, and blends it over another', () => {
        expect(parseColorWithAlpha('#05f')).toEqual({ color: { r: 0, g: 85, b: 255 }, alpha: 1 });
        expect(parseColorWithAlpha('rgb(0 0 0 / 0.45)')).toEqual({ color: BLACK, alpha: 0.45 });
        expect(parseColorWithAlpha('rgba(0, 0, 0, 45%)')).toEqual({ color: BLACK, alpha: 0.45 });
        expect(parseColorWithAlpha('#00000080')?.alpha).toBeCloseTo(0.5, 2);
        expect(parseColorWithAlpha('#0008')?.alpha).toBeCloseTo(0.53, 2);
        expect(parseColorWithAlpha('var(--x)')).toBeNull();
        expect(parseColorOver('rgb(0 0 0 / 0.5)', WHITE)).toEqual({ r: 127.5, g: 127.5, b: 127.5 });
        expect(parseColorOver('#ff0000', null)).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColorOver('rgb(0 0 0 / 0.5)', null)).toBeNull();
    });
});
