import { useEffect, useState } from 'react';

import type { Definition, Item, ListQuery } from '@panneau/protocol';

/** A related item: its id, and a label to show it. The value of a relation field. */
export interface RelationReference {
    id: string;
    label: string;
}

/** Where relation fields search for items. */
export interface RelationSource {
    /** Items of a resource that match a text, for the picker. */
    search(
        resource: string,
        query: string,
        options: { signal: AbortSignal },
    ): Promise<RelationReference[]>;
    /**
     * The references of items by id, for values that are only ids (`"12"`, `["12", "13"]`), as a
     * product's own API gives them. In any order; ids it doesn't find are left out, and keep their
     * id as label. Without it, fields show the ids.
     */
    resolve?(
        resource: string,
        ids: readonly string[],
        options: { signal: AbortSignal },
    ): Promise<RelationReference[]>;
    /**
     * Creates an item from the text typed in the picker, which offers "Create “…”" when this
     * method exists. It can open a dialog, and resolves with the reference of the new item, or with
     * `null` when nothing was created.
     */
    create?(resource: string, text: string): Promise<RelationReference | null>;
    /** Whether `create()` can create items of a resource. Defaults to true. */
    canCreate?(resource: string): boolean;
}

/** What `createRelationSource()` needs from an adapter: the `list()`, `get()` and `create()` of `@panneau/data`. */
export interface RelationListAdapter {
    list(
        resource: string,
        query?: ListQuery,
        options?: { signal?: AbortSignal },
    ): Promise<{ data: Item[] }>;
    /** One item, for `resolve()`. Without it, the source doesn't resolve ids. */
    get?(resource: string, id: string, options?: { signal?: AbortSignal }): Promise<Item>;
    /** Creates an item, for `create()`. */
    create?(resource: string, values: Record<string, unknown>): Promise<Item>;
}

export interface RelationSourceOptions {
    /** The definition, for the field that titles the items of each resource (`itemTitle`). */
    definition?: (Pick<Definition, 'resources'> & Partial<Pick<Definition, 'locales'>>) | null;
    /** Items per search. Defaults to 20. */
    perPage?: number;
    /** The label of an item, when `itemTitle` isn't enough. */
    getLabel?: (item: Item, resource: string) => string;
    /**
     * Lets the picker create items, with the adapter's `create()`. `true` sets the typed text as the
     * value of the resource's `itemTitle` field (in every locale of the definition when it is
     * localized), on the resources that allow `create`. A function gives the values of the new item
     * instead, or `null` for a resource where items can't be created.
     */
    create?: boolean | ((text: string, resource: string) => Record<string, unknown> | null);
}

function labelOf(value: unknown, locale?: string): string | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }
    if (value !== null && typeof value === 'object') {
        const localized = value as Record<string, unknown>;
        const first =
            (locale !== undefined ? localized[locale] : undefined) ?? Object.values(localized)[0];
        return typeof first === 'string' ? first : null;
    }
    return null;
}

/**
 * A relation source over an adapter, such as the `DataAdapter` of `@panneau/data`: a search is a
 * list query with `q`, ids are resolved with `get()`, and, with the `create` option, items are
 * created with `create()`. Labels come from the resource's `itemTitle`.
 */
export function createRelationSource(
    adapter: RelationListAdapter,
    { definition = null, perPage = 20, getLabel, create }: RelationSourceOptions = {},
): RelationSource {
    const resourceOf = (resource: string) =>
        definition?.resources.find((candidate) => candidate.id === resource);
    const toReference = (item: Item, resource: string): RelationReference => {
        const titleField = resourceOf(resource)?.itemTitle;
        return {
            id: item.id,
            label:
                getLabel?.(item, resource) ??
                (titleField !== undefined ? labelOf(item[titleField]) : null) ??
                item.id,
        };
    };
    const valuesOf = (text: string, resource: string): Record<string, unknown> | null => {
        if (typeof create === 'function') {
            return create(text, resource);
        }
        const definitionResource = resourceOf(resource);
        const titleField = definitionResource?.itemTitle;
        if (definitionResource === undefined || titleField === undefined) {
            return null;
        }
        const field = definitionResource.fields.find((candidate) => candidate.name === titleField);
        const locales = definition?.locales ?? [];
        return {
            [titleField]:
                field?.localized === true && locales.length > 0
                    ? Object.fromEntries(locales.map((locale) => [locale, text]))
                    : text,
        };
    };
    const source: RelationSource = {
        async search(resource, query, { signal }) {
            const response = await adapter.list(
                resource,
                { page: 1, perPage, ...(query !== '' ? { q: query } : {}) },
                { signal },
            );
            return response.data.map((item) => toReference(item, resource));
        },
    };
    const { get, create: createItem } = adapter;
    if (get !== undefined) {
        source.resolve = async (resource, ids, { signal }) => {
            const results = await Promise.allSettled(
                ids.map((id) => get.call(adapter, resource, id, { signal })),
            );
            return results.flatMap((result) =>
                result.status === 'fulfilled' ? [toReference(result.value, resource)] : [],
            );
        };
    }
    if (create !== undefined && create !== false && createItem !== undefined) {
        source.canCreate = (resource) =>
            resourceOf(resource)?.abilities?.create !== false && valuesOf('', resource) !== null;
        source.create = async (resource, text) => {
            const values = valuesOf(text, resource);
            if (values === null) {
                return null;
            }
            return toReference(await createItem.call(adapter, resource, values), resource);
        };
    }
    return source;
}

/** Reads relation values: references, ids, or lists of them. */
export function toReferences(value: unknown): RelationReference[] {
    const list = Array.isArray(value)
        ? value
        : value === null || value === undefined
          ? []
          : [value];
    return list.flatMap((entry: unknown) => {
        if (typeof entry === 'string' || typeof entry === 'number') {
            return [{ id: String(entry), label: String(entry) }];
        }
        if (entry !== null && typeof entry === 'object' && 'id' in entry) {
            const { id, label } = entry as { id: unknown; label?: unknown };
            if (typeof id === 'string' || typeof id === 'number') {
                return [{ id: String(id), label: typeof label === 'string' ? label : String(id) }];
            }
        }
        return [];
    });
}

interface ResolvedLabels {
    /** Labels by resource and id: `null` for ids that the source didn't find. */
    labels: Map<string, string | null>;
    /** Requests in flight, so that fields with the same ids share one. */
    pending: Map<string, Promise<void>>;
}

const resolved = new WeakMap<RelationSource, ResolvedLabels>();

function resolvedOf(source: RelationSource): ResolvedLabels {
    let entry = resolved.get(source);
    if (entry === undefined) {
        entry = { labels: new Map(), pending: new Map() };
        resolved.set(source, entry);
    }
    return entry;
}

const keyOf = (resource: string, id: string) => `${resource}\u0000${id}`;

/** Resolves the ids that no request has resolved or is resolving yet, and waits for all of them. */
function resolveIds(source: RelationSource, resource: string, ids: readonly string[]) {
    const { labels, pending } = resolvedOf(source);
    const fresh = ids.filter((id) => !pending.has(keyOf(resource, id)));
    if (fresh.length > 0 && source.resolve !== undefined) {
        // Shared by every field that asks for these ids: it isn't aborted when one unmounts.
        const request = source
            .resolve(resource, fresh, { signal: new AbortController().signal })
            .then(
                (found) => {
                    fresh.forEach((id) =>
                        labels.set(
                            keyOf(resource, id),
                            found.find((candidate) => candidate.id === id)?.label ?? null,
                        ),
                    );
                },
                () => {
                    // Tried again the next time a field shows these ids.
                    fresh.forEach((id) => pending.delete(keyOf(resource, id)));
                },
            );
        fresh.forEach((id) => pending.set(keyOf(resource, id), request));
    }
    return Promise.all(ids.map((id) => pending.get(keyOf(resource, id))));
}

/**
 * Relation references with the labels of plain ids: references whose label is their id (from
 * `"12"`) are resolved with the source's `resolve()`, once per source, resource and id. They keep
 * their id as label until then, or when the source doesn't find them.
 */
export function useRelationReferences(
    source: RelationSource | null,
    resource: string,
    references: readonly RelationReference[],
): RelationReference[] {
    const cache = source !== null ? resolvedOf(source).labels : null;
    const [labels, setLabels] = useState<Readonly<Record<string, string>>>({});
    const label = (id: string): string | undefined =>
        labels[keyOf(resource, id)] ?? cache?.get(keyOf(resource, id)) ?? undefined;
    const missing =
        source?.resolve !== undefined && cache !== null
            ? references
                  .filter((reference) => reference.label === reference.id)
                  .map((reference) => reference.id)
                  .filter((id) => !cache.has(keyOf(resource, id)))
            : [];
    const missingKey = missing.join('\u0000');

    useEffect(() => {
        const ids = missingKey === '' ? [] : missingKey.split('\u0000');
        if (source === null || cache === null || ids.length === 0) {
            return undefined;
        }
        let active = true;
        void resolveIds(source, resource, ids).then(() => {
            if (!active) {
                return;
            }
            const next: Record<string, string> = {};
            ids.forEach((id) => {
                const found = cache.get(keyOf(resource, id));
                if (typeof found === 'string') {
                    next[keyOf(resource, id)] = found;
                }
            });
            setLabels((current) => ({ ...current, ...next }));
        });
        return () => {
            active = false;
        };
    }, [source, cache, resource, missingKey]);

    return references.map((reference) =>
        reference.label === reference.id
            ? { id: reference.id, label: label(reference.id) ?? reference.id }
            : reference,
    );
}
