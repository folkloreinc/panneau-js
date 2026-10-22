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
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            window.removeEventListener('popstate', onPopState);
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

/** Navigates to a path of the app, without reloading the page. It doesn't ask the guards. */
export function navigate(path: string) {
    current += 1;
    window.history.pushState({ [INDEX_KEY]: current }, '', path);
    notify();
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
