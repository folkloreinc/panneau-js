import { useSyncExternalStore } from 'react';

import type { List, ListState } from '@panneau/core';

/** The state of a list created elsewhere (`createList()`, `useList()`), kept up to date. */
export function useListState(list: List): ListState {
    return useSyncExternalStore(list.subscribe, list.getState, list.getState);
}
