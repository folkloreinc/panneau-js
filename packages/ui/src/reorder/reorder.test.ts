import { describe, expect, it } from 'vitest';

import {
    REORDER_DRAG_TYPE,
    gapAt,
    gapAtPoint,
    indexForGap,
    isReorderDrag,
    isSameGap,
    moveItem,
    parseDuration,
} from './reorder';

describe('reorder', () => {
    it('moves a value of a list to another index, in a copy', () => {
        const list = ['a', 'b', 'c', 'd'];
        expect(moveItem(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
        expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
        expect(moveItem(list, 1, 1)).toEqual(list);
        expect(moveItem(list, 5, 0)).toEqual(list);
        expect(list).toEqual(['a', 'b', 'c', 'd']);
    });

    it('tells the drags of reorderable items from other drags', () => {
        expect(isReorderDrag(new Set([REORDER_DRAG_TYPE, 'application/x-list']))).toBe(true);
        expect(isReorderDrag(new Set(['image/png']))).toBe(false);
    });

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

    it('finds the gap at a point of a grid, row by row', () => {
        // Two rows: three items, then one
        const boxes = [
            { left: 0, top: 0, width: 100, height: 80 },
            { left: 110, top: 0, width: 100, height: 80 },
            { left: 220, top: 0, width: 100, height: 80 },
            { left: 0, top: 90, width: 100, height: 80 },
        ];
        expect(gapAtPoint(boxes, 10, 40)).toBe(0);
        expect(gapAtPoint(boxes, 60, 40)).toBe(1);
        expect(gapAtPoint(boxes, 300, 40)).toBe(3);
        // In the space between rows: before the next row
        expect(gapAtPoint(boxes, 300, 85)).toBe(3);
        expect(gapAtPoint(boxes, 10, 120)).toBe(3);
        expect(gapAtPoint(boxes, 80, 120)).toBe(4);
        expect(gapAtPoint(boxes, 200, 150)).toBe(4);
        expect(gapAtPoint([], 10, 10)).toBe(0);
        // From right to left: the first item is on the right
        const rtl = [
            { left: 220, top: 0, width: 100, height: 80 },
            { left: 110, top: 0, width: 100, height: 80 },
        ];
        expect(gapAtPoint(rtl, 300, 40, true)).toBe(0);
        expect(gapAtPoint(rtl, 250, 40, true)).toBe(1);
        expect(gapAtPoint(rtl, 10, 40, true)).toBe(2);
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
