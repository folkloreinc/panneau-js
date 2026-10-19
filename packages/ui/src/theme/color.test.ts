import { describe, expect, it } from 'vitest';

import {
    BLACK,
    WHITE,
    contrastRatio,
    ensureContrast,
    parseColor,
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
});
