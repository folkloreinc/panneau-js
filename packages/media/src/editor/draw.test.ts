import { describe, expect, it } from 'vitest';

import { hasProportionsOf } from './draw';

describe('hasProportionsOf', () => {
    const original = { width: 6240, height: 4160 };

    it('accepts a smaller copy, give or take the rounding of its pixels', () => {
        expect(hasProportionsOf(original, 400, 267)).toBe(true);
        expect(hasProportionsOf(original, 400, 266)).toBe(true);
        expect(hasProportionsOf(original, 6240, 4160)).toBe(true);
    });

    it('refuses other proportions, or an image without a size', () => {
        expect(hasProportionsOf(original, 400, 400)).toBe(false);
        expect(hasProportionsOf(original, 267, 400)).toBe(false);
        expect(hasProportionsOf(original, 0, 0)).toBe(false);
    });
});
