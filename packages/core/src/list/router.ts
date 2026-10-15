/**
 * The part of a router that lists need: read and write the query string, and know when it
 * changes (back and forward). An app adapts its own router to it.
 */
export interface Router {
    /** The current query string, without `?`. */
    getSearch(): string;
    /** Navigates to the same path with another query string. `replace` doesn't add a history entry. */
    setSearch(search: string, options?: { replace?: boolean }): void;
    /** Calls `listener` when the query string changes. Returns a function that unsubscribes. */
    subscribe(listener: () => void): () => void;
}

/** A router over `window.history` and `window.location`. */
export function createHistoryRouter(target: Window = window): Router {
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());
    return {
        getSearch: () => target.location.search.replace(/^\?/, ''),
        setSearch(search, { replace = false } = {}) {
            const url = `${target.location.pathname}${search !== '' ? `?${search}` : ''}${target.location.hash}`;
            if (replace) {
                target.history.replaceState(target.history.state, '', url);
            } else {
                target.history.pushState(target.history.state, '', url);
            }
            notify();
        },
        subscribe(listener) {
            listeners.add(listener);
            target.addEventListener('popstate', listener);
            return () => {
                listeners.delete(listener);
                target.removeEventListener('popstate', listener);
            };
        },
    };
}

/** A router that keeps the query string in memory, for tests and embedded lists. */
export interface MemoryRouter extends Router {
    /** Query strings of the history entries, the last one being the current one. */
    history: string[];
    /** Goes back to the previous entry, like the browser's back button. */
    back(): void;
}

/** Creates a router that keeps the query string in memory. */
export function createMemoryRouter(initialSearch = ''): MemoryRouter {
    const history = [initialSearch];
    const listeners = new Set<() => void>();
    const notify = () => listeners.forEach((listener) => listener());
    return {
        history,
        getSearch: () => history.at(-1) ?? '',
        back() {
            if (history.length > 1) {
                history.pop();
                notify();
            }
        },
        setSearch(search, { replace = false } = {}) {
            if (replace) {
                history[history.length - 1] = search;
            } else {
                history.push(search);
            }
            notify();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
