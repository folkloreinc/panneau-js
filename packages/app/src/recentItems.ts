import { useEffect } from 'react';

import { usePanneau } from '@panneau/core';

/** An item the user opened, for the "Go to…" palette. */
export interface RecentItem {
    resource: string;
    id: string;
    title: string;
}

const LIMIT = 8;

/** The key of the recent items of an app (its base path) and a user, in `localStorage`. */
function storageKey(basePath: string, user: string): string {
    return `panneau:recent:${basePath}:${user}`;
}

/** The items the user opened last, the most recent first. Empty when storage can't be read. */
export function readRecentItems(basePath: string, user: string): RecentItem[] {
    try {
        const stored: unknown = JSON.parse(
            window.localStorage.getItem(storageKey(basePath, user)) ?? '[]',
        );
        return Array.isArray(stored)
            ? stored.filter(
                  (entry): entry is RecentItem =>
                      typeof entry === 'object' &&
                      entry !== null &&
                      typeof (entry as RecentItem).resource === 'string' &&
                      typeof (entry as RecentItem).id === 'string' &&
                      typeof (entry as RecentItem).title === 'string',
              )
            : [];
    } catch {
        return [];
    }
}

/** Puts an item first in the recent items, keeping the last 8. */
export function recordRecentItem(basePath: string, user: string, item: RecentItem) {
    const items = [
        item,
        ...readRecentItems(basePath, user).filter(
            (entry) => entry.resource !== item.resource || entry.id !== item.id,
        ),
    ].slice(0, LIMIT);
    try {
        window.localStorage.setItem(storageKey(basePath, user), JSON.stringify(items));
    } catch {
        // The palette then shows no recent items.
    }
}

/** The user the recent items belong to: the id of the definition's user. */
export function useRecentScope(): string {
    return String(usePanneau().definition?.user?.id ?? '');
}

/** Records an item as opened, once it is loaded and has a title. */
export function useRecordRecentItem(basePath: string, item: RecentItem | null) {
    const user = useRecentScope();
    const resource = item?.resource;
    const id = item?.id;
    const title = item?.title;
    useEffect(() => {
        if (resource !== undefined && id !== undefined && title !== undefined && title !== '') {
            recordRecentItem(basePath, user, { resource, id, title });
        }
    }, [basePath, user, resource, id, title]);
}
