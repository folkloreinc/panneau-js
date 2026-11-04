import { createContext, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';

/**
 * How the actions of rows fit (decision 0060), the same for every row of a list: `0`, every
 * action as an icon but the main one, with its label; `1`, every action as an icon; `n` from 2,
 * the last `n` actions of each row in its menu.
 */
export const RowActionsFit = createContext(0);

/** What the fit of a list depends on, besides its width: its items and its columns. */
export function fitContent(
    items: readonly { id: string }[],
    columns: readonly { id: string }[],
): string {
    return `${items.map((item) => item.id).join('\u0000')}\u0001${columns.map((column) => column.id).join('\u0000')}`;
}

/** Past that many actions in the menu, a row has nothing left to free. */
const MAX_LEVEL = 12;

/** The most of the width of its row that the actions of an item take before they crowd it. */
const SHARE = 0.4;

/**
 * From that many actions on a row, they also go to the menu to give the content room, as long as
 * `SHOWN` of them stay out of it.
 */
const MANY = 5;
const SHOWN = 4;

interface Measure {
    /**
     * The room the content lacks: the height of the list, since rows grow when their content
     * wraps, and what the displays that clamp their text (`data-clamp`) cut off.
     */
    height: number;
    /**
     * How much the actions don't fit, in pixels: what the list and the boxes of actions overflow,
     * the lines that actions wrap to, and what they take of their row past `SHARE`.
     */
    crowding: number;
    /** The most actions a row has, in the row and its menu. */
    count: number;
}

function measure(element: HTMLElement): Measure {
    let crowding = Math.max(0, element.scrollWidth - element.clientWidth);
    let count = 0;
    for (const actions of element.querySelectorAll<HTMLElement>('[data-row-actions]')) {
        count = Math.max(count, Number(actions.dataset.rowActions));
        const box = actions.parentElement;
        if (box !== null) {
            crowding += Math.max(0, box.scrollWidth - box.clientWidth);
        }
        const first = actions.firstElementChild;
        if (first instanceof HTMLElement) {
            crowding += Math.max(0, actions.offsetHeight - first.offsetHeight);
        }
        const row = actions.closest<HTMLElement>('tr, li') ?? element;
        crowding += Math.max(0, actions.offsetWidth - row.offsetWidth * SHARE);
    }
    let cut = 0;
    for (const text of element.querySelectorAll<HTMLElement>('[data-clamp]')) {
        cut += Math.max(0, text.scrollHeight - text.clientHeight);
    }
    return { height: element.offsetHeight + cut, crowding, count };
}

/**
 * Whether rows of `count` actions can give the content room with `level`: only when they have many
 * actions, `SHOWN` of which stay out of the menu.
 */
function forContent(level: number, count: number): boolean {
    return count >= MANY && count - level >= SHOWN;
}

/** Whether the next level is worth a try, after `current`. */
function worthTrying(next: number, current: Measure): boolean {
    if (next === 1) {
        return current.crowding > 0.5 || forContent(next, current.count);
    }
    return (
        next <= Math.min(current.count, MAX_LEVEL) &&
        current.count >= 2 &&
        (current.crowding > 0.5 || forContent(next, current.count))
    );
}

/**
 * The best of the levels tried: the actions crowd least, then the rows are shortest (when the
 * level may give the content room), then the fewest changes.
 */
function best(measures: ReadonlyMap<number, Measure>): number {
    let chosen = 0;
    for (const [level, current] of measures) {
        const kept = measures.get(chosen);
        if (kept === undefined || level === chosen) {
            continue;
        }
        if (current.crowding < kept.crowding - 0.5) {
            chosen = level;
        } else if (
            current.crowding <= kept.crowding + 0.5 &&
            forContent(level, current.count) &&
            current.height < kept.height - 0.5
        ) {
            chosen = level;
        }
    }
    return chosen;
}

/**
 * The level of a list, outside React: it changes while the list commits, and React draws each
 * change at once (`useSyncExternalStore`), before the browser paints.
 */
class FitStore {
    #level = 0;
    #settled = false;
    /** The measures of the levels tried. */
    #measures = new Map<number, Measure>();
    #content: string | null = null;
    readonly #listeners = new Set<() => void>();

    readonly subscribe = (listener: () => void): (() => void) => {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    };

    readonly getLevel = (): number => this.#level;

    #set(level: number): void {
        if (level !== this.#level) {
            this.#level = level;
            for (const listener of this.#listeners) {
                listener();
            }
        }
    }

    /** Starts over from the labels: true when the list has to draw them first. */
    restart(): boolean {
        this.#settled = false;
        this.#measures = new Map();
        const drawn = this.#level === 0;
        this.#set(0);
        return !drawn;
    }

    /** Starts over when the content changes. */
    setContent(content: string): boolean {
        if (content === this.#content) {
            return false;
        }
        this.#content = content;
        return this.restart();
    }

    /** Measures the list drawn at `drawn`, then tries the next level, or settles on the best. */
    step(element: HTMLElement, drawn: number): void {
        if (this.#settled || drawn !== this.#level) {
            return;
        }
        const current = measure(element);
        this.#measures.set(drawn, current);
        const next = drawn + 1;
        if (worthTrying(next, current)) {
            this.#set(next);
        } else {
            this.#settled = true;
            this.#set(best(this.#measures));
        }
    }
}

/**
 * Fits the actions of the rows of a list in the room they have (decision 0060). It draws each
 * level in turn, from every action as an icon but the main one, labelled, then the main one as an
 * icon too, then a menu of two actions, three…, while the next one may help, and keeps the best:
 * where the actions crowd least (the list overflows, the actions of a row wrap or take more than
 * 40% of it), then, on rows of five actions or more, where the rows are shortest (their content
 * wraps or is cut less), then the fewest actions in the menu.
 *
 * @returns the level, and a callback ref for the element to measure: the list, which holds the
 * actions.
 */
export function useRowActionsFit(
    content: string,
): [level: number, measure: (element: HTMLElement | null) => void] {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [store] = useState(() => new FitStore());
    const level = useSyncExternalStore(store.subscribe, store.getLevel, store.getLevel);

    useLayoutEffect(() => {
        if (element !== null && !store.setContent(content)) {
            store.step(element, level);
        }
    }, [store, element, content, level]);

    useEffect(() => {
        // Without ResizeObserver (jsdom), the list fits once, at its first width.
        if (element === null || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        let width = element.clientWidth;
        const observer = new ResizeObserver(() => {
            if (element.clientWidth !== width) {
                width = element.clientWidth;
                if (!store.restart()) {
                    store.step(element, 0);
                }
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [store, element]);

    return [level, setElement];
}
