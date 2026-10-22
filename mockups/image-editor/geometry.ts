/**
 * The geometry of the protocol's `MediaTransform`, for the mockups: a crop in pixels of the upright
 * original, then a clockwise rotation, then flips. The editor shows the image as it will be
 * rendered (rotated and flipped), so it converts between that view and the original.
 */

export interface Size {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect extends Point, Size {}

export type Rotation = 0 | 90 | 180 | 270;

/** The protocol's `MediaTransform`. */
export interface Transform {
    crop?: Rect;
    rotate?: Rotation;
    flipX?: boolean;
    flipY?: boolean;
    /** From 0 to 1, relative to the upright original. */
    focalPoint?: Point;
}

/** The size of an image once rotated. */
export function viewSize(size: Size, rotate: Rotation = 0): Size {
    return rotate === 90 || rotate === 270
        ? { width: size.height, height: size.width }
        : { ...size };
}

function rotatePoint({ x, y }: Point, { width, height }: Size, rotate: Rotation): Point {
    switch (rotate) {
        case 90:
            return { x: height - y, y: x };
        case 180:
            return { x: width - x, y: height - y };
        case 270:
            return { x: y, y: width - x };
        default:
            return { x, y };
    }
}

/** A point of the original, in the view: rotated, then flipped. */
export function toView(point: Point, size: Size, transform: Transform): Point {
    const view = viewSize(size, transform.rotate);
    const rotated = rotatePoint(point, size, transform.rotate ?? 0);
    return {
        x: transform.flipX === true ? view.width - rotated.x : rotated.x,
        y: transform.flipY === true ? view.height - rotated.y : rotated.y,
    };
}

/** A point of the view, in the original. */
export function fromView(point: Point, size: Size, transform: Transform): Point {
    const view = viewSize(size, transform.rotate);
    const unflipped = {
        x: transform.flipX === true ? view.width - point.x : point.x,
        y: transform.flipY === true ? view.height - point.y : point.y,
    };
    return rotatePoint(unflipped, view, ((360 - (transform.rotate ?? 0)) % 360) as Rotation);
}

function rectBetween(a: Point, b: Point): Rect {
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
    };
}

/** A rectangle of the original, in the view. */
export function rectToView(rect: Rect, size: Size, transform: Transform): Rect {
    return rectBetween(
        toView(rect, size, transform),
        toView({ x: rect.x + rect.width, y: rect.y + rect.height }, size, transform),
    );
}

/** A rectangle of the view, in whole pixels of the original. */
export function rectFromView(rect: Rect, size: Size, transform: Transform): Rect {
    const found = rectBetween(
        fromView(rect, size, transform),
        fromView({ x: rect.x + rect.width, y: rect.y + rect.height }, size, transform),
    );
    return {
        x: Math.round(found.x),
        y: Math.round(found.y),
        width: Math.round(found.width),
        height: Math.round(found.height),
    };
}

/** The crop of a transform, in the view: the whole image without one. */
export function cropInView(size: Size, transform: Transform): Rect {
    return rectToView(
        transform.crop ?? { x: 0, y: 0, width: size.width, height: size.height },
        size,
        transform,
    );
}

/** The SVG transform that draws the original as the view shows it. */
export function svgTransform({ width, height }: Size, transform: Transform): string {
    const view = viewSize({ width, height }, transform.rotate);
    const parts: string[] = [];
    if (transform.flipX === true) {
        parts.push(`translate(${String(view.width)} 0) scale(-1 1)`);
    }
    if (transform.flipY === true) {
        parts.push(`translate(0 ${String(view.height)}) scale(1 -1)`);
    }
    switch (transform.rotate) {
        case 90:
            parts.push(`translate(${String(height)} 0) rotate(90)`);
            break;
        case 180:
            parts.push(`translate(${String(width)} ${String(height)}) rotate(180)`);
            break;
        case 270:
            parts.push(`translate(0 ${String(width)}) rotate(270)`);
            break;
        default:
            break;
    }
    return parts.join(' ');
}

/** The focal point in the view, in pixels: the center without one. */
export function focalInView(size: Size, transform: Transform): Point {
    const focal = transform.focalPoint ?? { x: 0.5, y: 0.5 };
    return toView({ x: focal.x * size.width, y: focal.y * size.height }, size, transform);
}

/** The largest crop of a ratio inside a rectangle, centered on a point as far as it can be. */
export function cropAround(within: Rect, ratio: number, center: Point): Rect {
    const width = Math.min(within.width, within.height * ratio);
    const height = width / ratio;
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    return {
        x: clamp(center.x - width / 2, within.x, within.x + within.width - width),
        y: clamp(center.y - height / 2, within.y, within.y + within.height - height),
        width,
        height,
    };
}

/** A ratio as text: `16:9`, or `1.85:1` when it isn't a simple one. */
export function ratioLabel(width: number, height: number): string {
    const ratio = width / height;
    for (const [a, b] of [
        [1, 1],
        [16, 9],
        [9, 16],
        [4, 3],
        [3, 4],
        [3, 2],
        [2, 3],
        [4, 5],
        [5, 4],
        [21, 9],
    ] as const) {
        if (Math.abs(ratio - a / b) < 0.01) {
            return `${String(a)}:${String(b)}`;
        }
    }
    return `${ratio.toFixed(2)}:1`;
}
