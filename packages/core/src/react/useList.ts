import { useState, useSyncExternalStore } from 'react';

import { type List, type ListOptions, type ListState, createList } from '../list/list';
import { usePanneau } from './provider';

export interface UseListResult extends ListState {
    /** The list, to change the query and the selection. */
    list: List;
}

/**
 * Creates a list for the life of the component. Without a `router` option, the query is kept in
 * the router of the closest `PanneauProvider`, if any. Pass `router: null` to keep it in memory.
 */
export function useList(options: ListOptions = {}): UseListResult {
    const context = usePanneau();
    const [list] = useState(() =>
        createList({
            ...options,
            router: options.router === undefined ? context.router : options.router,
        }),
    );
    const state = useSyncExternalStore(list.subscribe, list.getState, list.getState);
    return { ...state, list };
}
