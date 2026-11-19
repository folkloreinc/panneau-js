import { type RefObject, useEffect, useState } from 'react';

import { prefersReducedMotion } from '@panneau/ui';

import type { ListItem } from './types';

/** Reads a CSS time (`0.2s`, `200ms`, or a list of them) as the longest, in milliseconds. */
function toMilliseconds(value: string): number {
    return Math.max(
        0,
        ...value.split(',').map((part) => {
            const time = Number.parseFloat(part);
            if (Number.isNaN(time)) {
                return 0;
            }
            return part.trim().endsWith('ms') ? time : time * 1000;
        }),
    );
}

/**
 * How long the items that leave fade out in `root`: the animation of their element, or of its
 * cells in a table. 0 without one, such as in a layout that doesn't animate them.
 */
function getLeaveDuration(root: HTMLElement | null): number {
    const element = root?.querySelector<HTMLElement>('[data-leaving]');
    if (element === null || element === undefined) {
        return 0;
    }
    const animated = element instanceof HTMLTableRowElement ? element.cells[0] : element;
    if (animated === undefined) {
        return 0;
    }
    const style = window.getComputedStyle(animated);
    return toMilliseconds(style.animationDuration) + toMilliseconds(style.animationDelay);
}

interface Leaving {
    item: ListItem;
    /** Where the item was, in the items before it left. */
    index: number;
}

/**
 * Puts the items that left back where they were, so that they can fade out.
 */
export function withLeavingItems(
    items: readonly ListItem[],
    leaving: readonly Leaving[],
): ListItem[] {
    const shown = [...items];
    for (const { item, index } of [...leaving].sort((a, b) => a.index - b.index)) {
        shown.splice(Math.min(index, shown.length), 0, item);
    }
    return shown;
}

/**
 * Keeps the items that left the list for a moment, so that they fade out instead of vanishing: an
 * item deleted, or one a change took out of the filters. Not after the query changed: the first
 * items that come after a new page, search or filter replace the others at once.
 *
 * They go when their animation ends (`animationend` in `root`), as long as the theme makes it. A timer a little longer than the animation removes them when it
 * doesn't end, and at once without an animation.
 */
export function useLeavingItems(
    items: readonly ListItem[] | undefined,
    queryKey: string,
    root: RefObject<HTMLElement | null>,
): { leaving: readonly Leaving[]; isLeaving: (item: ListItem) => boolean } {
    const [state, setState] = useState<{
        items: readonly ListItem[] | undefined;
        queryKey: string;
        // The query changed since the items came: the next ones are its results.
        replacing: boolean;
        leaving: readonly Leaving[];
    }>({ items, queryKey, replacing: false, leaving: [] });

    if (state.queryKey !== queryKey) {
        setState({ items, queryKey, replacing: true, leaving: [] });
    } else if (state.items !== items) {
        const previous = state.items;
        const leaving =
            state.replacing || previous === undefined || items === undefined
                ? []
                : previous.flatMap((item, index) =>
                      items.some((candidate) => candidate.id === item.id) ? [] : [{ item, index }],
                  );
        setState({ items, queryKey, replacing: items === undefined, leaving });
    }

    const { leaving } = state;
    useEffect(() => {
        const element = root.current;
        if (leaving.length === 0) {
            return undefined;
        }
        const leave = () => setState((current) => ({ ...current, leaving: [] }));
        // Gone once they faded out: their animation, not another one of an element in them
        const onAnimationEnd = (event: Event) => {
            const { animationName } = event as AnimationEvent;
            const target = event.target as Element | null;
            if (
                typeof animationName === 'string' &&
                animationName.includes('leave') &&
                target?.closest?.('[data-leaving]') !== null
            ) {
                leave();
            }
        };
        element?.addEventListener('animationend', onAnimationEnd);
        const duration = prefersReducedMotion() ? 0 : getLeaveDuration(element);
        // Only in case the animation doesn't end: hidden, or interrupted
        const timeout = window.setTimeout(leave, duration > 0 ? duration + 100 : 0);
        return () => {
            element?.removeEventListener('animationend', onAnimationEnd);
            window.clearTimeout(timeout);
        };
    }, [leaving, root]);

    return {
        leaving,
        isLeaving: (item) => leaving.some((left) => left.item.id === item.id),
    };
}
