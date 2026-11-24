/**
 * The logic of a reorder, without the DOM. A list of `count` items has `count + 1` gaps: gap `0`
 * is before the first item, gap `count` after the last one. An item dropped in a gap moves there.
 */

/**
 * The type of the data of every drag of a `ReorderList`, beside the type of its own list: other
 * drop targets, such as a drop zone of files around the list, refuse it (`isReorderDrag()`).
 */
export const REORDER_DRAG_TYPE = 'application/x-panneau-reorder';

/**
 * Whether a drag is one of the items of a `ReorderList`, from the types of its data, as React
 * Aria's `getDropOperation` gets them. A drop target outside the list refuses it, or a keyboard
 * drag would go to it.
 */
export function isReorderDrag(types: { has: (type: string) => boolean }): boolean {
    return types.has(REORDER_DRAG_TYPE);
}

/** Whether dropping the item at `from` in `gap` leaves it where it is: the gaps on either side. */
export function isSameGap(from: number, gap: number): boolean {
    return gap === from || gap === from + 1;
}

/**
 * A copy of `list` with the value at `from` moved to `to`: what the `onMove` of a `ReorderList`
 * does to the values of its items.
 */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
    const next = [...list];
    const [value] = next.splice(from, 1);
    if (value !== undefined) {
        next.splice(to, 0, value);
    }
    return next;
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

/** The box of an item, in the coordinates of its list. */
export interface ItemBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * The gap at a point of a grid, from the boxes of its items in their order: before the first item
 * on a row below the point, or on its row with its middle past the point (to its left in a list
 * that reads from right to left); after the last one otherwise.
 */
export function gapAtPoint(boxes: readonly ItemBox[], x: number, y: number, isRtl = false): number {
    const index = boxes.findIndex((box) => {
        if (y < box.top) {
            return true;
        }
        if (y >= box.top + box.height) {
            return false;
        }
        const middle = box.left + box.width / 2;
        return isRtl ? x > middle : x < middle;
    });
    return index === -1 ? boxes.length : index;
}

/** A duration of CSS (`200ms`, `0.2s`) in milliseconds, or 0. */
export function parseDuration(value: string): number {
    const duration = Number.parseFloat(value);
    if (Number.isNaN(duration)) {
        return 0;
    }
    return value.trim().endsWith('ms') ? duration : duration * 1000;
}
