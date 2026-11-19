import { useEffect, useState } from 'react';

import { prefersReducedMotion } from '@panneau/ui';

import type { ListItem } from './types';

/** How long an item that left the list stays, fading out: `--panneau-duration-slow`. */
export const LEAVE_DURATION = 200;

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
 */
export function useLeavingItems(
    items: readonly ListItem[] | undefined,
    queryKey: string,
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
        if (leaving.length === 0) {
            return undefined;
        }
        const timeout = window.setTimeout(
            () => setState((current) => ({ ...current, leaving: [] })),
            prefersReducedMotion() ? 0 : LEAVE_DURATION,
        );
        return () => window.clearTimeout(timeout);
    }, [leaving]);

    return {
        leaving,
        isLeaving: (item) => leaving.some((left) => left.item.id === item.id),
    };
}
