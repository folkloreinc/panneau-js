import {
    type ReactNode,
    createContext,
    use,
    useEffect,
    useId,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

import type { CommandPage } from '@panneau/core';
import type { Action } from '@panneau/protocol';

/** An action of the current item, as its button runs it (decision 0116). */
export interface PageAction {
    action: Action;
    /** The link of a `link` action, or `null` for one that runs. */
    href: string | null;
    /** Presses its button: the same confirmation, runner and toasts. */
    run: () => void;
}

type PageParts = Omit<CommandPage, 'route'>;

interface Published {
    page: PageParts | null;
    /** The actions of the items shown, the last shown last: the palette offers the last ones. */
    actions: readonly { id: string; actions: readonly PageAction[] }[];
}

function createStore() {
    let published: Published = { page: null, actions: [] };
    const listeners = new Set<() => void>();
    return {
        get: () => published,
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        /** Changes what is published, and tells the palette only when it changed. */
        update: (change: (current: Published) => Published) => {
            const next = change(published);
            if (next !== published) {
                published = next;
                listeners.forEach((listener) => listener());
            }
        },
    };
}

function samePage(a: PageParts | null, b: PageParts | null): boolean {
    return (
        a === b ||
        (a !== null &&
            b !== null &&
            a.resource === b.resource &&
            a.item === b.item &&
            a.selection === b.selection)
    );
}

function sameActions(a: readonly PageAction[], b: readonly PageAction[]): boolean {
    return (
        a.length === b.length &&
        a.every((entry, index) => entry.action === b[index]?.action && entry.href === b[index].href)
    );
}

type Store = ReturnType<typeof createStore>;

const CurrentPageContext = createContext<{ store: Store; route: string } | null>(null);

/** Holds what the current page publishes, for the palette of the shell (decision 0116). */
export function CurrentPageProvider({ route, children }: { route: string; children: ReactNode }) {
    const [store] = useState(createStore);
    return <CurrentPageContext value={{ store, route }}>{children}</CurrentPageContext>;
}

/**
 * Publishes the resource, the item and the selection of the page while it is shown. A render that
 * changes none of them changes nothing.
 */
export function usePublishPage(page: PageParts | null): void {
    const store = use(CurrentPageContext)?.store;
    useEffect(() => {
        store?.update((current) => (samePage(current.page, page) ? current : { ...current, page }));
    }, [store, page]);
    useEffect(
        () =>
            store !== undefined
                ? () => store.update((current) => ({ ...current, page: null }))
                : undefined,
        [store],
    );
}

/**
 * Publishes the actions of an item while its buttons are shown. A render with the same actions
 * changes nothing: the palette runs them through the latest functions of the buttons.
 */
export function usePublishItemActions(actions: readonly PageAction[]): void {
    const store = use(CurrentPageContext)?.store;
    const id = useId();
    const latest = useRef(actions);
    useEffect(() => {
        latest.current = actions;
        store?.update((current) => {
            const index = current.actions.findIndex((entry) => entry.id === id);
            const previous = current.actions[index];
            if (previous !== undefined && sameActions(previous.actions, actions)) {
                return current;
            }
            const entry = {
                id,
                actions: actions.map(({ action, href }) => ({
                    action,
                    href,
                    run: () => latest.current.find((other) => other.action === action)?.run(),
                })),
            };
            // In place: the item shown last stays last
            return {
                ...current,
                actions:
                    previous !== undefined
                        ? current.actions.map((other) => (other.id === id ? entry : other))
                        : [...current.actions, entry],
            };
        });
    }, [store, id, actions]);
    useEffect(
        () =>
            store !== undefined
                ? () =>
                      store.update((current) => ({
                          ...current,
                          actions: current.actions.filter((entry) => entry.id !== id),
                      }))
                : undefined,
        [store, id],
    );
}

const EMPTY: Published = { page: null, actions: [] };

/** The current page and the actions of its item, or `null` outside of the app's shell. */
export function useCurrentPage(): { page: CommandPage; actions: readonly PageAction[] } | null {
    const context = use(CurrentPageContext);
    const published = useSyncExternalStore(
        context?.store.subscribe ?? (() => () => undefined),
        context?.store.get ?? (() => EMPTY),
    );
    if (context === null) {
        return null;
    }
    return {
        page: { route: context.route, ...published.page },
        actions: published.actions.at(-1)?.actions ?? [],
    };
}
