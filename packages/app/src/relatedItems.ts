import type { Item } from '@panneau/protocol';

interface RelatedItemRequestBase {
    /** Tells a request from the one before. */
    id: number;
    /** The resource of the item. */
    resource: string;
    /**
     * Ends the request: with the item once it is saved, or `null` when the panel closes without
     * saving.
     */
    settle: (item: Item | null) => void;
}

/** An item to create in the panel over the page (decision 0110). */
export interface RelatedItemCreateRequest extends RelatedItemRequestBase {
    mode: 'create';
    /** Its first values: the text typed in the relation field, as its title. */
    values: Record<string, unknown>;
}

/** An item to edit in the panel over the page, from its card (decision 0110). */
export interface RelatedItemEditRequest extends RelatedItemRequestBase {
    mode: 'edit';
    /** The id of the item. */
    item: string;
}

export type RelatedItemRequest = RelatedItemCreateRequest | RelatedItemEditRequest;

/**
 * The items that relation fields ask the app to create or to edit: one at a time, in the panel
 * that the shell shows over the page (decision 0110). The relation source opens them, and the
 * shell subscribes.
 */
export interface RelatedItemRequests {
    /** Opens the panel to create an item, and resolves with it, or `null` when nothing was created. */
    open: (resource: string, values: Record<string, unknown>) => Promise<Item | null>;
    /** Opens the panel to edit an item, and resolves with it once saved, or `null`. */
    edit: (resource: string, id: string) => Promise<Item | null>;
    /** The request shown, or `null`. */
    get: () => RelatedItemRequest | null;
    subscribe: (listener: () => void) => () => void;
}

type RequestInput =
    | Pick<RelatedItemCreateRequest, 'mode' | 'resource' | 'values'>
    | Pick<RelatedItemEditRequest, 'mode' | 'resource' | 'item'>;

export function createRelatedItemRequests(): RelatedItemRequests {
    let current: RelatedItemRequest | null = null;
    let count = 0;
    const listeners = new Set<() => void>();
    const set = (next: RelatedItemRequest | null) => {
        current = next;
        listeners.forEach((listener) => listener());
    };
    const start = (input: RequestInput) =>
        new Promise<Item | null>((resolve) => {
            // One panel at a time: a new request ends the one before
            current?.settle(null);
            count += 1;
            const request: RelatedItemRequest = {
                ...input,
                id: count,
                settle: (item) => {
                    if (current === request) {
                        set(null);
                    }
                    resolve(item);
                },
            };
            set(request);
        });
    return {
        open: (resource, values) => start({ mode: 'create', resource, values }),
        edit: (resource, id) => start({ mode: 'edit', resource, item: id }),
        get: () => current,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
