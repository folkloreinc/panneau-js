import {
    type ReactNode,
    createContext,
    use,
    useEffect,
    useId,
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
        update: (change: (current: Published) => Published) => {
            published = change(published);
            listeners.forEach((listener) => listener());
        },
    };
}

type Store = ReturnType<typeof createStore>;

const CurrentPageContext = createContext<{ store: Store; route: string } | null>(null);

/** Holds what the current page publishes, for the palette of the shell (decision 0116). */
export function CurrentPageProvider({ route, children }: { route: string; children: ReactNode }) {
    const [store] = useState(createStore);
    return <CurrentPageContext value={{ store, route }}>{children}</CurrentPageContext>;
}

/** Publishes the resource, the item and the selection of the page while it is shown. */
export function usePublishPage(page: PageParts | null): void {
    const store = use(CurrentPageContext)?.store;
    useEffect(() => {
        if (store === undefined) {
            return undefined;
        }
        store.update((current) => ({ ...current, page }));
        return () => store.update((current) => ({ ...current, page: null }));
    }, [store, page]);
}

/** Publishes the actions of an item while its buttons are shown. */
export function usePublishItemActions(actions: readonly PageAction[]): void {
    const store = use(CurrentPageContext)?.store;
    const id = useId();
    useEffect(() => {
        if (store === undefined) {
            return undefined;
        }
        const others = (list: Published['actions']) => list.filter((entry) => entry.id !== id);
        store.update((current) => ({
            ...current,
            actions: [...others(current.actions), { id, actions }],
        }));
        return () => store.update((current) => ({ ...current, actions: others(current.actions) }));
    }, [store, id, actions]);
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
