import type { MediaTransform } from '@panneau/protocol';

/**
 * The geometry of the protocol's `MediaTransform`: a crop in pixels of the upright image, then a
 * clockwise rotation, then flips. The editor shows the image as it will be rendered (rotated and
 * flipped), the view, and converts between it and the pixels of the image.
 */

// Type aliases rather than interfaces, so that they fit the protocol's loose objects.
export type Size = { width: number; height: number };

export type Point = { x: number; y: number };

export type Rect = Point & Size;

export type Rotation = 0 | 90 | 180 | 270;

/** The edits the geometry reads: those of the protocol, without the base. */
export type Edits = Pick<MediaTransform, 'crop' | 'rotate' | 'flipX' | 'flipY' | 'focalPoint'>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** The size of an image once rotated. */
export function viewSize(size: Size, rotate: Rotation = 0): Size {
    return rotate === 90 || rotate === 270
        ? { width: size.height, height: size.width }
        : { width: size.width, height: size.height };
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

/** A point of the image, in the view: rotated, then flipped. */
export function toView(point: Point, size: Size, edits: Edits): Point {
    const view = viewSize(size, edits.rotate);
    const rotated = rotatePoint(point, size, edits.rotate ?? 0);
    return {
        x: edits.flipX === true ? view.width - rotated.x : rotated.x,
        y: edits.flipY === true ? view.height - rotated.y : rotated.y,
    };
}

/** A point of the view, in the image. */
export function fromView(point: Point, size: Size, edits: Edits): Point {
    const view = viewSize(size, edits.rotate);
    const unflipped = {
        x: edits.flipX === true ? view.width - point.x : point.x,
        y: edits.flipY === true ? view.height - point.y : point.y,
    };
    return rotatePoint(unflipped, view, ((360 - (edits.rotate ?? 0)) % 360) as Rotation);
}

function rectBetween(a: Point, b: Point): Rect {
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
    };
}

/** A rectangle of the image, in the view. */
export function rectToView(rect: Rect, size: Size, edits: Edits): Rect {
    return rectBetween(
        toView(rect, size, edits),
        toView({ x: rect.x + rect.width, y: rect.y + rect.height }, size, edits),
    );
}

/** A rectangle of the view, in whole pixels of the image, as the protocol stores a crop. */
export function rectFromView(rect: Rect, size: Size, edits: Edits): Rect {
    const found = rectBetween(
        fromView(rect, size, edits),
        fromView({ x: rect.x + rect.width, y: rect.y + rect.height }, size, edits),
    );
    const x = clamp(Math.round(found.x), 0, size.width - 1);
    const y = clamp(Math.round(found.y), 0, size.height - 1);
    return {
        x,
        y,
        width: clamp(Math.round(found.width), 1, size.width - x),
        height: clamp(Math.round(found.height), 1, size.height - y),
    };
}

/** The crop of the edits, in the view: the whole image without one. */
export function cropInView(size: Size, edits: Edits): Rect {
    return rectToView(
        edits.crop ?? { x: 0, y: 0, width: size.width, height: size.height },
        size,
        edits,
    );
}

/** The SVG transform that draws the image as the view shows it. */
export function svgTransform({ width, height }: Size, edits: Edits): string {
    const view = viewSize({ width, height }, edits.rotate);
    const parts: string[] = [];
    if (edits.flipX === true) {
        parts.push(`translate(${String(view.width)} 0) scale(-1 1)`);
    }
    if (edits.flipY === true) {
        parts.push(`translate(0 ${String(view.height)}) scale(1 -1)`);
    }
    switch (edits.rotate) {
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

/** The focal point in the view, in pixels: the center of the image without one. */
export function focalInView(size: Size, edits: Edits): Point {
    const focal = edits.focalPoint ?? { x: 0.5, y: 0.5 };
    return toView({ x: focal.x * size.width, y: focal.y * size.height }, size, edits);
}

/** A point of the view as a focal point: from 0 to 1, relative to the image. */
export function focalFromView(point: Point, size: Size, edits: Edits): Point {
    const found = fromView(point, size, edits);
    const round = (value: number) => Math.round(clamp(value, 0, 1) * 1000) / 1000;
    return { x: round(found.x / size.width), y: round(found.y / size.height) };
}

/** The largest crop of a ratio inside a rectangle, centered on a point as far as it can be. */
export function cropAround(within: Rect, ratio: number, center: Point): Rect {
    const width = Math.min(within.width, within.height * ratio);
    const height = width / ratio;
    return {
        x: clamp(center.x - width / 2, within.x, within.x + within.width - width),
        y: clamp(center.y - height / 2, within.y, within.y + within.height - height),
        width,
        height,
    };
}

/**
 * A crop inside an image, for a crop made on another version of it (decision 0031): what falls
 * outside is cut off, and a crop wholly outside is dropped.
 */
export function clampCrop(crop: Rect, size: Size): Rect | null {
    const x = clamp(crop.x, 0, size.width);
    const y = clamp(crop.y, 0, size.height);
    const width = Math.min(crop.x + crop.width, size.width) - x;
    const height = Math.min(crop.y + crop.height, size.height) - y;
    return width >= 1 && height >= 1 ? { x, y, width, height } : null;
}

/** Moves a rectangle within bounds. */
export function moveRect(rect: Rect, dx: number, dy: number, bounds: Size): Rect {
    return {
        ...rect,
        x: clamp(rect.x + dx, 0, bounds.width - rect.width),
        y: clamp(rect.y + dy, 0, bounds.height - rect.height),
    };
}

/** A corner or an edge of a crop frame. */
export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** Moves the edges of a rectangle that a handle holds, within bounds, keeping a ratio if any. */
export function resizeRect(
    rect: Rect,
    handle: Handle,
    dx: number,
    dy: number,
    ratio: number | null,
    bounds: Size,
): Rect {
    const min = Math.min(bounds.width, bounds.height) * 0.05;
    const west = handle.includes('w');
    const north = handle.includes('n');
    if (ratio !== null) {
        const anchor = {
            x: west ? rect.x + rect.width : rect.x,
            y: north ? rect.y + rect.height : rect.y,
        };
        const roomX = west ? anchor.x : bounds.width - anchor.x;
        const roomY = north ? anchor.y : bounds.height - anchor.y;
        const largest = Math.min(roomX, roomY * ratio);
        const width = clamp(
            west ? rect.width - dx : rect.width + dx,
            Math.min(min, largest),
            largest,
        );
        const height = width / ratio;
        return {
            x: west ? anchor.x - width : anchor.x,
            y: north ? anchor.y - height : anchor.y,
            width,
            height,
        };
    }
    let left = rect.x;
    let right = rect.x + rect.width;
    let top = rect.y;
    let bottom = rect.y + rect.height;
    if (west) {
        left = clamp(left + dx, 0, right - min);
    } else if (handle.includes('e')) {
        right = clamp(right + dx, left + min, bounds.width);
    }
    if (north) {
        top = clamp(top + dy, 0, bottom - min);
    } else if (handle.includes('s')) {
        bottom = clamp(bottom + dy, top + min, bounds.height);
    }
    return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Where a handle sits on a rectangle. */
export function handlePoint(rect: Rect, handle: Handle): Point {
    const x = handle.includes('w')
        ? rect.x
        : handle.includes('e')
          ? rect.x + rect.width
          : rect.x + rect.width / 2;
    const y = handle.includes('n')
        ? rect.y
        : handle.includes('s')
          ? rect.y + rect.height
          : rect.y + rect.height / 2;
    return { x, y };
}

/** Whether two transforms have the same edits, whatever the order of their keys. */
export function sameEdits(a: Edits | null | undefined, b: Edits | null | undefined): boolean {
    const normalized = (edits: Edits | null | undefined) =>
        JSON.stringify({
            crop: edits?.crop
                ? [edits.crop.x, edits.crop.y, edits.crop.width, edits.crop.height]
                : null,
            rotate: edits?.rotate ?? 0,
            flipX: edits?.flipX === true,
            flipY: edits?.flipY === true,
            focalPoint: edits?.focalPoint ? [edits.focalPoint.x, edits.focalPoint.y] : null,
        });
    return normalized(a) === normalized(b);
}
