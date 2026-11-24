import type { Item } from '@panneau/protocol';

/** An item to create in the panel over the page (decision 0110). */
export interface RelatedItemRequest {
    /** Tells a request from the one before. */
    id: number;
    /** The resource of the new item. */
    resource: string;
    /** Its first values: the text typed in the relation field, as its title. */
    values: Record<string, unknown>;
    /** Ends the request: with the new item once it is saved, or `null` when the panel closes. */
    settle: (item: Item | null) => void;
}

/**
 * The items that relation fields ask the app to create: one at a time, in the panel that the shell
 * shows over the page (decision 0110). The relation source opens them, and the shell subscribes.
 */
export interface RelatedItemRequests {
    /** Opens the panel, and resolves with the new item, or `null` when nothing was created. */
    open: (resource: string, values: Record<string, unknown>) => Promise<Item | null>;
    /** The request shown, or `null`. */
    get: () => RelatedItemRequest | null;
    subscribe: (listener: () => void) => () => void;
}

export function createRelatedItemRequests(): RelatedItemRequests {
    let current: RelatedItemRequest | null = null;
    let count = 0;
    const listeners = new Set<() => void>();
    const set = (next: RelatedItemRequest | null) => {
        current = next;
        listeners.forEach((listener) => listener());
    };
    return {
        open: (resource, values) =>
            new Promise((resolve) => {
                // One panel at a time: a new request ends the one before
                current?.settle(null);
                count += 1;
                const request: RelatedItemRequest = {
                    id: count,
                    resource,
                    values,
                    settle: (item) => {
                        if (current === request) {
                            set(null);
                        }
                        resolve(item);
                    },
                };
                set(request);
            }),
        get: () => current,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
