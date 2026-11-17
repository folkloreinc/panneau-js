/** A point of the drawing, in its coordinates: `x` from 0 (left) to 100, `y` from 0 (top) to 100. */
export interface PlotPoint {
    x: number;
    y: number;
}

/** The scale of a chart: its bounds and the values of its graduations, from the lowest. */
export interface Scale {
    min: number;
    max: number;
    ticks: number[];
}

/** Rounded, so that 0.1 + 0.2 stays 0.3 on an axis. */
function round(value: number): number {
    return Number(value.toPrecision(12));
}

/**
 * A scale that holds `low` and `high`, in 2 to 4 steps of 1, 2 or 5 times a power of 10:
 * 0 to 1500 by 500 for values up to 1340. `min` and `max` fix a bound instead (0 to 1 for a
 * ratio), the ticks still on round values between them.
 */
export function niceScale(
    low: number,
    high: number,
    { min, max }: { min?: number | undefined; max?: number | undefined } = {},
): Scale {
    const from = min ?? Math.min(0, low);
    const to = max ?? Math.max(high, from);
    const range = to - from;
    if (range <= 0) {
        // Every value at the bottom (all 0): one step of 1, so the line lies on the baseline
        return { min: from, max: from + 1, ticks: [from] };
    }
    const rough = range / 3;
    const power = 10 ** Math.floor(Math.log10(rough));
    const step = round(
        [1, 2, 5].map((multiple) => multiple * power).find((s) => s >= rough) ?? 10 * power,
    );
    const start = min ?? round(Math.floor(from / step) * step);
    const end = max ?? round(Math.ceil(to / step) * step);
    const ticks: number[] = [];
    for (let tick = Math.ceil(start / step) * step; tick <= end + step / 1e6; tick += step) {
        ticks.push(round(tick));
    }
    return { min: start, max: end, ticks };
}

/** The tangent of the curve at the middle of three points (monotone, as d3's `curveMonotoneX`). */
function innerTangent(previous: PlotPoint, point: PlotPoint, next: PlotPoint): number {
    const h0 = point.x - previous.x;
    const h1 = next.x - point.x;
    const s0 = (point.y - previous.y) / h0;
    const s1 = (next.y - point.y) / h1;
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    return (
        (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p))
    );
}

/** The tangent at an end, from the tangent next to it. */
function endTangent(from: PlotPoint, to: PlotPoint, tangent: number): number {
    const h = to.x - from.x;
    return h !== 0 ? (3 * ((to.y - from.y) / h) - tangent) / 2 : tangent;
}

/**
 * The path of a curve through the points, without passing above or below them between two of them
 * (a monotone cubic curve): a count never dips under 0 nor peaks between two days. Its shape doesn't
 * change when the drawing is stretched, as it is to the width of the chart.
 */
export function monotonePath(points: PlotPoint[]): string {
    const first = points[0];
    if (first === undefined) {
        return '';
    }
    if (points.length < 3) {
        return linearPath(points);
    }
    const last = points.length - 1;
    const inner = (index: number): number => {
        const previous = points[index - 1];
        const point = points[index];
        const next = points[index + 1];
        return previous !== undefined && point !== undefined && next !== undefined
            ? innerTangent(previous, point, next)
            : 0;
    };
    const tangent = (index: number): number => {
        const from = points[index === 0 ? 0 : last - 1];
        const to = points[index === 0 ? 1 : last];
        if ((index === 0 || index === last) && from !== undefined && to !== undefined) {
            return endTangent(from, to, inner(index === 0 ? 1 : last - 1));
        }
        return inner(index);
    };
    let path = `M${first.x},${first.y}`;
    let previous = first;
    let previousTangent = tangent(0);
    for (const [index, point] of points.entries()) {
        if (index === 0) {
            continue;
        }
        const pointTangent = tangent(index);
        const dx = (point.x - previous.x) / 3;
        path += ` C${round(previous.x + dx)},${round(previous.y + dx * previousTangent)} ${round(point.x - dx)},${round(point.y - dx * pointTangent)} ${point.x},${point.y}`;
        previous = point;
        previousTangent = pointTangent;
    }
    return path;
}

/** The path of straight segments through the points. */
export function linearPath(points: PlotPoint[]): string {
    return points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
        .join(' ');
}

/**
 * The points labeled under a chart: the first, the last, and others at regular steps between them,
 * `count` at most. The ones at odd places are `minor`: hidden when the chart is narrow.
 */
export function axisLabelIndices(
    length: number,
    count: number,
): { index: number; minor: boolean }[] {
    if (length === 0) {
        return [];
    }
    if (length === 1) {
        return [{ index: 0, minor: false }];
    }
    const step = Math.max(1, Math.ceil((length - 1) / (count - 1)));
    const indices: { index: number; minor: boolean }[] = [];
    for (let index = 0; index < length - 1; index += step) {
        // Not too close to the last one, which always has its label
        if (index === 0 || length - 1 - index >= step / 2) {
            indices.push({ index, minor: (index / step) % 2 === 1 });
        }
    }
    indices.push({ index: length - 1, minor: false });
    return indices;
}
