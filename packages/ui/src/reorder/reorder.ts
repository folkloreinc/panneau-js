/**
 * The logic of a reorder, without the DOM. A list of `count` items has `count + 1` gaps: gap `0`
 * is before the first item, gap `count` after the last one. An item dropped in a gap moves there.
 */

/** Whether dropping the item at `from` in `gap` leaves it where it is: the gaps on either side. */
export function isSameGap(from: number, gap: number): boolean {
    return gap === from || gap === from + 1;
}

/** The index the item at `from` takes once dropped in `gap`. */
export function indexForGap(from: number, gap: number): number {
    return gap > from ? gap - 1 : gap;
}

/**
 * The gap at a position along the list, from the middles of its items in the same order and
 * coordinates: before the first item whose middle is past the position, or after the last one.
 */
export function gapAt(middles: readonly number[], position: number): number {
    const index = middles.findIndex((middle) => position < middle);
    return index === -1 ? middles.length : index;
}

/** A duration of CSS (`200ms`, `0.2s`) in milliseconds, or 0. */
export function parseDuration(value: string): number {
    const duration = Number.parseFloat(value);
    if (Number.isNaN(duration)) {
        return 0;
    }
    return value.trim().endsWith('ms') ? duration : duration * 1000;
}
