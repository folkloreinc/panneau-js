import { describe, expect, it } from 'vitest';

import { matchesRatio, parseRatio, renderedCropSize } from './transforms';

describe('parseRatio', () => {
    it('reads `width:height`', () => {
        expect(parseRatio('16:9')).toBeCloseTo(16 / 9);
        expect(parseRatio('1:1')).toBe(1);
    });

    it.each(['16/9', '0:1', '1:0', '1.5:1', ''])('refuses %j', (ratio) => {
        expect(parseRatio(ratio)).toBeNull();
    });
});

describe('matchesRatio', () => {
    it('allows one pixel, since crops are in whole pixels', () => {
        expect(matchesRatio(1600, 900, '16:9')).toBe(true);
        // 1601 / (16 / 9) is 900.56: within one pixel.
        expect(matchesRatio(1601, 900, '16:9')).toBe(true);
        expect(matchesRatio(1600, 902, '16:9')).toBe(false);
        expect(matchesRatio(900, 900, 1)).toBe(true);
    });

    it('refuses a ratio it cannot read', () => {
        expect(matchesRatio(1600, 900, '16/9')).toBe(false);
    });
});

describe('renderedCropSize', () => {
    it('swaps the width and the height of a crop turned a quarter', () => {
        const crop = { x: 0, y: 0, width: 1600, height: 900 };
        expect(renderedCropSize({ crop })).toEqual({ width: 1600, height: 900 });
        expect(renderedCropSize({ crop, rotate: 180 })).toEqual({ width: 1600, height: 900 });
        expect(renderedCropSize({ crop, rotate: 90 })).toEqual({ width: 900, height: 1600 });
        expect(renderedCropSize({ crop, rotate: 270 })).toEqual({ width: 900, height: 1600 });
    });

    it('is null without a crop', () => {
        expect(renderedCropSize({ rotate: 90 })).toBeNull();
    });
});
