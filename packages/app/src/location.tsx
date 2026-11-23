import { type ComponentProps, type MouseEvent, useSyncExternalStore } from 'react';

// A minimal history-mode location. Each entry of the app keeps its position in the history
// (`panneauIndex`), so that a guard can undo going back or forward and ask first.

const INDEX_KEY = 'panneauIndex';

const listeners = new Set<() => void>();

/** What guards going back or forward, such as forms with unsaved changes. */
export interface HistoryGuard {
    /** Whether going back or forward needs a confirmation now. */
    isBlocking(): boolean;
    /** Resolves `true` to leave, `false` to stay. */
    confirmLeave(): Promise<boolean>;
}

let guard: HistoryGuard | null = null;
// The position of the current entry, and whether the next move is already confirmed
let current = 0;
let confirmed = false;

/** Where a page of the app was scrolled: the window, and the element that holds the page. */
export interface ScrollPosition {
    window: number;
    container: number;
}

// The scroll of each entry of the history, saved when the app leaves it, so that going back or
// forward to it restores it. Whether the last move went back or forward.
const positions = new Map<number, ScrollPosition>();
let container: HTMLElement | null = null;
let wentBackOrForward = false;

function saveScroll() {
    positions.set(current, { window: window.scrollY, container: container?.scrollTop ?? 0 });
}

/**
 * Sets the element that holds the pages, whose scroll the history keeps with the window's: the
 * main element of the layout. Returns a function that removes it.
 */
export function setScrollContainer(element: HTMLElement | null): () => void {
    container = element;
    return () => {
        if (container === element) {
            container = null;
        }
    };
}

/**
 * The scroll to restore on the current entry: where it was left, when the browser went back or
 * forward to it. `null` after a new navigation, which starts at the top.
 */
export function getRestoredScroll(): ScrollPosition | null {
    return wentBackOrForward ? (positions.get(current) ?? null) : null;
}

function readIndex(state: unknown): number | null {
    const value =
        state !== null && typeof state === 'object'
            ? (state as Record<string, unknown>)[INDEX_KEY]
            : undefined;
    return typeof value === 'number' ? value : null;
}

function notify() {
    listeners.forEach((listener) => listener());
}

function onPopState(event: PopStateEvent) {
    const index = readIndex(event.state);
    if (index !== null && index !== current && !confirmed && guard?.isBlocking() === true) {
        // Undo the move, then make it again once the user chose to leave
        const delta = index - current;
        window.history.go(-delta);
        void guard.confirmLeave().then((leave) => {
            if (leave) {
                confirmed = true;
                window.history.go(delta);
            }
        });
        return;
    }
    confirmed = false;
    // The page shown is still the one the browser left
    saveScroll();
    wentBackOrForward = true;
    if (index !== null) {
        current = index;
    }
    notify();
}

function subscribe(listener: () => void) {
    if (listeners.size === 0) {
        // The entry the app starts on
        const index = readIndex(window.history.state);
        if (index === null) {
            window.history.replaceState(
                { ...(window.history.state as object | null), [INDEX_KEY]: current },
                '',
            );
        } else {
            current = index;
        }
        window.addEventListener('popstate', onPopState);
        // The app restores the scroll of its pages once they render, not the browser before
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            window.removeEventListener('popstate', onPopState);
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        }
    };
}

/** The current path, updated on navigation and on back and forward. */
export function usePathname(): string {
    return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/**
 * Sets what guards going back and forward: the shell's leave guards. Returns a function that
 * removes it.
 */
export function setHistoryGuard(next: HistoryGuard): () => void {
    guard = next;
    return () => {
        if (guard === next) {
            guard = null;
        }
    };
}

/**
 * Navigates to a path of the app, without reloading the page. It doesn't ask the guards. With
 * `replace`, the path replaces the current entry of the history, which Back then skips.
 */
export function navigate(path: string, { replace = false }: { replace?: boolean } = {}) {
    wentBackOrForward = false;
    if (replace) {
        window.history.replaceState({ [INDEX_KEY]: current }, '', path);
    } else {
        saveScroll();
        current += 1;
        // A new entry, after those that Back left: their positions are gone with them
        for (const index of positions.keys()) {
            if (index >= current) {
                positions.delete(index);
            }
        }
        window.history.pushState({ [INDEX_KEY]: current }, '', path);
    }
    notify();
}

/**
 * Loads a page with a navigation of the browser, rather than in place: for another context of the
 * app (decision 0045), whose state starts over.
 */
export function loadPage(url: string, { replace = false }: { replace?: boolean } = {}) {
    if (replace) {
        window.location.replace(url);
    } else {
        window.location.assign(url);
    }
}

/** A link to a path of the app. Plain clicks navigate without reloading the page. */
export function Link({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            (props.target !== undefined && props.target !== '_self')
        ) {
            return;
        }
        event.preventDefault();
        navigate(href);
    };
    return <a {...props} href={href} onClick={handleClick} />;
}
