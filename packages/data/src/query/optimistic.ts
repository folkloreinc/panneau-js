import { type QueryClient, type QueryKey, hashKey } from '@tanstack/react-query';

import type { Item, ListResponse } from '@panneau/protocol';

import type { Values } from '../adapter';
import { queryKeys } from './keys';

/** An edit of an item that the server hasn't answered yet. */
export interface PendingEdit {
    values: Values;
}

/** The edits of one item that are still being saved. */
interface ItemEdits {
    /** The edits not answered yet, in the order they were made. */
    pending: PendingEdit[];
    /** The fields the edits changed, to put back when they fail. */
    fields: Set<string>;
    /** The item as the server last gave it, once one of the edits is saved. */
    saved: Item | undefined;
    /** Each cached copy of the item before the first edit, by the hash of its query. */
    before: Map<string, Item>;
    /** The versions that the edits replaced: a version sent, and the one the server gave back. */
    versions: Map<string, string>;
    /** The last save of the item, that the next one waits for. */
    tail: Promise<unknown>;
}

const clients = new WeakMap<QueryClient, Map<string, ItemEdits>>();

function getEdits(client: QueryClient): Map<string, ItemEdits> {
    let edits = clients.get(client);
    if (edits === undefined) {
        edits = new Map();
        clients.set(client, edits);
    }
    return edits;
}

function getItemEdits(client: QueryClient, resource: string, id: string): ItemEdits {
    const edits = getEdits(client);
    const key = hashKey(queryKeys.item(resource, id));
    let state = edits.get(key);
    if (state === undefined) {
        state = {
            pending: [],
            fields: new Set(),
            saved: undefined,
            before: new Map(),
            versions: new Map(),
            tail: Promise.resolve(),
        };
        edits.set(key, state);
    }
    return state;
}

interface Copy {
    key: QueryKey;
    item: Item;
    /** Whether it is the item's own query, rather than a list. */
    own: boolean;
}

/** Each cached copy of an item: in the item's query, and in the lists of its resource. */
function getCopies(client: QueryClient, resource: string, id: string): Copy[] {
    const copies: Copy[] = [];
    const itemKey = queryKeys.item(resource, id);
    const item = client.getQueryData<Item>(itemKey);
    if (item !== undefined) {
        copies.push({ key: itemKey, item, own: true });
    }
    for (const [key, list] of client.getQueriesData<ListResponse>({
        queryKey: queryKeys.lists(resource),
    })) {
        const copy = Array.isArray(list?.data)
            ? list.data.find((candidate) => candidate.id === id)
            : undefined;
        if (copy !== undefined) {
            copies.push({ key, item: copy, own: false });
        }
    }
    return copies;
}

/**
 * Writes what an item shows while it has edits: the item the server last gave back, or each copy
 * with the fields of failed edits put back, under the values of the edits still pending. The
 * version stays the one the server gave, until it answers.
 */
function show(client: QueryClient, resource: string, id: string, state: ItemEdits): void {
    const values: Values = Object.assign({}, ...state.pending.map((edit) => edit.values));
    for (const { key, item: copy, own } of getCopies(client, resource, id)) {
        let base = state.saved;
        if (base === undefined) {
            const before = state.before.get(hashKey(key));
            base = { ...copy };
            for (const field of state.fields) {
                if (before !== undefined) {
                    base[field] = before[field];
                }
            }
        }
        const next: Item = { ...base, ...values };
        if (own) {
            client.setQueryData<Item>(key, next);
        } else {
            client.setQueryData<ListResponse>(key, (list) =>
                list === undefined
                    ? list
                    : {
                          ...list,
                          data: list.data.map((candidate) =>
                              candidate.id === id ? next : candidate,
                          ),
                      },
            );
        }
    }
}

/**
 * Starts an optimistic edit of an item: stops the fetches of the item and of the lists of its
 * resource, which would write over it, keeps each cached copy to put back on failure, and shows
 * the values at once in every copy.
 */
export async function startEdit(
    client: QueryClient,
    resource: string,
    id: string,
    values: Values,
): Promise<PendingEdit> {
    const state = getItemEdits(client, resource, id);
    const edit: PendingEdit = { values };
    state.pending.push(edit);
    for (const field of Object.keys(values)) {
        state.fields.add(field);
    }
    await Promise.all([
        client.cancelQueries({ queryKey: queryKeys.item(resource, id), exact: true }),
        client.cancelQueries({ queryKey: queryKeys.lists(resource) }),
    ]);
    for (const { key, item } of getCopies(client, resource, id)) {
        const hash = hashKey(key);
        if (!state.before.has(hash)) {
            state.before.set(hash, item);
        }
    }
    show(client, resource, id, state);
    return edit;
}

/**
 * Sends an edit after the edits of the same item sent before it. A version that an earlier edit
 * replaced is sent as the version the server gave back for it: the second of two quick edits,
 * made from the item before the first was saved, doesn't conflict with the first.
 */
export function sendInTurn(
    client: QueryClient,
    resource: string,
    id: string,
    version: string | null | undefined,
    send: (version: string | null | undefined) => Promise<Item>,
): Promise<Item> {
    const state = getItemEdits(client, resource, id);
    const sent = state.tail.then(async () => {
        let current = version;
        const seen = new Set<string>();
        while (current != null && state.versions.has(current) && !seen.has(current)) {
            seen.add(current);
            current = state.versions.get(current);
        }
        const item = await send(current);
        if (current != null && typeof item.version === 'string' && item.version !== current) {
            state.versions.set(current, item.version);
        }
        return item;
    });
    state.tail = sent.catch(() => undefined);
    return sent;
}

/**
 * Ends an optimistic edit, with the item the server gave back (saved, or the current item of a
 * conflict), or without it when the save failed: its values go, and the item shows what the
 * server has under the edits still pending. Says whether no edit of the item is pending any more,
 * and whether the server gave back an item for one of them.
 */
export function endEdit(
    client: QueryClient,
    resource: string,
    id: string,
    edit: PendingEdit,
    saved?: Item,
): { done: boolean; saved: boolean } {
    const state = getItemEdits(client, resource, id);
    state.pending = state.pending.filter((candidate) => candidate !== edit);
    if (saved !== undefined) {
        state.saved = saved;
    }
    show(client, resource, id, state);
    const done = state.pending.length === 0;
    if (done) {
        getEdits(client).delete(hashKey(queryKeys.item(resource, id)));
    }
    return { done, saved: state.saved !== undefined };
}
