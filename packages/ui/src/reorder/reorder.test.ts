import { describe, expect, it } from 'vitest';

import { gapAt, indexForGap, isSameGap, parseDuration } from './reorder';

describe('reorder', () => {
    it('leaves an item in place in the gaps on either side of it', () => {
        expect(isSameGap(2, 2)).toBe(true);
        expect(isSameGap(2, 3)).toBe(true);
        expect(isSameGap(2, 1)).toBe(false);
        expect(isSameGap(2, 4)).toBe(false);
    });

    it('gives the index an item takes in a gap', () => {
        // Down: the gap is past the item, which leaves its place
        expect(indexForGap(0, 4)).toBe(3);
        expect(indexForGap(1, 3)).toBe(2);
        // Up: the item takes the place of the item after the gap
        expect(indexForGap(3, 0)).toBe(0);
        expect(indexForGap(3, 1)).toBe(1);
    });

    it('finds the gap at a position from the middles of the items', () => {
        const middles = [50, 150, 250];
        expect(gapAt(middles, 10)).toBe(0);
        expect(gapAt(middles, 60)).toBe(1);
        expect(gapAt(middles, 249)).toBe(2);
        expect(gapAt(middles, 300)).toBe(3);
        expect(gapAt([], 10)).toBe(0);
    });

    it('reads a duration of CSS in milliseconds', () => {
        expect(parseDuration('200ms')).toBe(200);
        expect(parseDuration(' 0.2s')).toBe(200);
        expect(parseDuration('0ms')).toBe(0);
        expect(parseDuration('')).toBe(0);
    });
});
