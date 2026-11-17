import { describe, expect, it } from 'vitest';

import { axisLabelIndices, linearPath, monotonePath, niceScale } from './geometry';

describe('niceScale', () => {
    it('goes from 0 to a round value above the highest, in round steps', () => {
        expect(niceScale(0, 16)).toEqual({ min: 0, max: 20, ticks: [0, 10, 20] });
        expect(niceScale(0, 1340)).toEqual({ min: 0, max: 1500, ticks: [0, 500, 1000, 1500] });
        expect(niceScale(0, 0.3)).toEqual({ min: 0, max: 0.3, ticks: [0, 0.1, 0.2, 0.3] });
    });

    it('goes under 0 for negative values', () => {
        expect(niceScale(-12, 30)).toEqual({ min: -20, max: 40, ticks: [-20, 0, 20, 40] });
    });

    it('keeps fixed bounds', () => {
        expect(niceScale(0, 0.4, { min: 0, max: 1 })).toEqual({
            min: 0,
            max: 1,
            ticks: [0, 0.5, 1],
        });
    });

    it('has one step of 1 when every value is 0', () => {
        expect(niceScale(0, 0)).toEqual({ min: 0, max: 1, ticks: [0] });
    });
});

describe('monotonePath', () => {
    it('never goes past its points between two of them', () => {
        const points = [
            { x: 0, y: 100 },
            { x: 25, y: 0 },
            { x: 50, y: 0 },
            { x: 75, y: 100 },
            { x: 100, y: 100 },
        ];
        const path = monotonePath(points);
        const numbers = [...path.matchAll(/-?[\d.]+/g)].map((match) => Number(match[0]));
        const ys = numbers.filter((_, index) => index % 2 === 1);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...ys)).toBeLessThanOrEqual(100);
        // Flat where two points are equal
        expect(path).toContain('C33.3333333333,0 41.6666666667,0 50,0');
    });

    it('joins two points straight, and draws nothing without any', () => {
        expect(
            monotonePath([
                { x: 0, y: 10 },
                { x: 100, y: 20 },
            ]),
        ).toBe('M0,10 L100,20');
        expect(monotonePath([])).toBe('');
    });
});

describe('linearPath', () => {
    it('joins the points straight', () => {
        expect(
            linearPath([
                { x: 0, y: 10 },
                { x: 50, y: 0 },
            ]),
        ).toBe('M0,10 L50,0');
    });
});

describe('axisLabelIndices', () => {
    it('labels the first and last points, and others at regular steps', () => {
        expect(axisLabelIndices(14, 7)).toEqual([
            { index: 0, minor: false },
            { index: 3, minor: true },
            { index: 6, minor: false },
            { index: 9, minor: true },
            { index: 13, minor: false },
        ]);
    });

    it('labels every point of a short series', () => {
        expect(axisLabelIndices(3, 7).map(({ index }) => index)).toEqual([0, 1, 2]);
        expect(axisLabelIndices(1, 7)).toEqual([{ index: 0, minor: false }]);
        expect(axisLabelIndices(0, 7)).toEqual([]);
    });
});
