import { describe, expect, it } from 'vitest';

import {
    type Edits,
    clampCrop,
    cropAround,
    cropInView,
    focalFromView,
    focalInView,
    fromView,
    rectFromView,
    resizeRect,
    sameEdits,
    toView,
    viewSize,
} from './geometry';

const size = { width: 400, height: 300 };
const EDITS: Edits[] = [0, 90, 180, 270].flatMap((rotate) =>
    [false, true].flatMap((flipX) =>
        [false, true].map((flipY) => ({ rotate: rotate as 0 | 90 | 180 | 270, flipX, flipY })),
    ),
);

describe('the view', () => {
    it('swaps the width and the height of an image turned a quarter', () => {
        expect(viewSize(size, 90)).toEqual({ width: 300, height: 400 });
        expect(viewSize(size, 180)).toEqual(size);
    });

    it('turns clockwise, then flips', () => {
        // The top left corner goes to the top right once turned a quarter clockwise.
        expect(toView({ x: 0, y: 0 }, size, { rotate: 90 })).toEqual({ x: 300, y: 0 });
        expect(toView({ x: 0, y: 0 }, size, { rotate: 90, flipX: true })).toEqual({ x: 0, y: 0 });
        expect(toView({ x: 0, y: 0 }, size, { flipY: true })).toEqual({ x: 0, y: 300 });
    });

    it.each(EDITS)('finds a point of the image again from the view, with %j', (edits) => {
        const point = { x: 120, y: 45 };
        expect(fromView(toView(point, size, edits), size, edits)).toEqual(point);
    });

    it.each(EDITS)('keeps a crop in whole pixels of the image, with %j', (edits) => {
        const crop = { x: 100, y: 50, width: 160, height: 90 };
        const inView = cropInView(size, { ...edits, crop });
        expect(rectFromView(inView, size, edits)).toEqual(crop);
    });

    it('keeps a crop from the view inside the image', () => {
        expect(rectFromView({ x: -3.4, y: 10.6, width: 500, height: 100 }, size, {})).toEqual({
            x: 0,
            y: 11,
            width: 400,
            height: 100,
        });
    });

    it('places the focal point from 0 to 1 of the image, whatever the view', () => {
        const edits: Edits = { rotate: 90, focalPoint: { x: 0.25, y: 0.5 } };
        const inView = focalInView(size, edits);
        expect(focalFromView(inView, size, edits)).toEqual({ x: 0.25, y: 0.5 });
        expect(focalInView(size, {})).toEqual({ x: 200, y: 150 });
    });
});

describe('crops', () => {
    it('makes the largest crop of a ratio around a point, inside the image', () => {
        expect(cropAround({ x: 0, y: 0, ...size }, 1, { x: 390, y: 150 })).toEqual({
            x: 100,
            y: 0,
            width: 300,
            height: 300,
        });
    });

    it('keeps the ratio of a frame resized by a corner, within the image', () => {
        const frame = resizeRect(
            { x: 0, y: 0, width: 160, height: 90 },
            'se',
            1000,
            0,
            16 / 9,
            size,
        );
        expect(frame.width / frame.height).toBeCloseTo(16 / 9);
        expect(frame.width).toBeLessThanOrEqual(400);
        expect(frame.height).toBeLessThanOrEqual(300);
    });

    it('moves only the edge a handle holds, without a ratio', () => {
        expect(
            resizeRect({ x: 10, y: 10, width: 100, height: 100 }, 'w', -5, 50, null, size),
        ).toEqual({ x: 5, y: 10, width: 105, height: 100 });
    });

    it('cuts a crop to an image that changed, and drops one wholly outside', () => {
        const crop = { x: 0, y: 1200, width: 3024, height: 1701 };
        expect(clampCrop(crop, { width: 3024, height: 2500 })).toEqual({
            x: 0,
            y: 1200,
            width: 3024,
            height: 1300,
        });
        expect(clampCrop(crop, { width: 3024, height: 1000 })).toBeNull();
    });
});

describe('sameEdits', () => {
    it('compares the edits, not the order of their keys or their defaults', () => {
        expect(sameEdits({ rotate: 90, flipX: true }, { flipX: true, rotate: 90 })).toBe(true);
        expect(sameEdits({ rotate: 0, flipX: false }, {})).toBe(true);
        expect(sameEdits({ rotate: 90 }, { rotate: 270 })).toBe(false);
        expect(sameEdits(null, {})).toBe(true);
    });
});
