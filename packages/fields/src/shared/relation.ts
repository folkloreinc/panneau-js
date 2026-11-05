import { useEffect, useState } from 'react';

import type { Definition, Item, ListQuery } from '@panneau/protocol';
import { getImageUrl, getItemImageField } from '@panneau/protocol/runtime';

/**
 * A related item: its id, and a label to show it. The value of a relation field. Its card also
 * shows its `description` and its image, when the source gives them (decision 0067).
 */
export interface RelationReference {
    id: string;
    label: string;
    /** A line under the label: the related resource's `itemSubtitle`, as text. */
    description?: string;
    /** The URL of its image: the related resource's `itemImage` (decision 0061). */
    imageUrl?: string;
}

/** How a relation field shows the items of a resource, in its cards (decision 0067). */
export interface RelationResourceInfo {
    /** The name of the resource's icon, for items without an image. */
    icon?: string;
    /** Whether its items have an image (`itemImage`). */
    image?: boolean;
    /** Whether its items have a description (`itemSubtitle`). */
    description?: boolean;
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
    /**
     * How the items of a resource show in their cards: its icon, and whether they have an image or
     * a description. When they do, references that come without them (`{ id, label }`, from items)
     * get them from `resolve()`.
     */
    describe?(resource: string): RelationResourceInfo | null;
    /** Where an item opens, for the link of its card. Without it, or `null`, the card has none. */
    getItemHref?(resource: string, id: string): string | null;
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
    /** Where an item opens, for the link of its card, such as its page in the app. */
    getItemHref?: (resource: string, id: string) => string | null;
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
    { definition = null, perPage = 20, getLabel, create, getItemHref }: RelationSourceOptions = {},
): RelationSource {
    const resourceOf = (resource: string) =>
        definition?.resources.find((candidate) => candidate.id === resource);
    const toReference = (item: Item, resource: string): RelationReference => {
        const definitionResource = resourceOf(resource);
        const titleField = definitionResource?.itemTitle;
        const subtitleField = definitionResource?.itemSubtitle;
        const imageField =
            definitionResource !== undefined ? getItemImageField(definitionResource) : undefined;
        const description = subtitleField !== undefined ? labelOf(item[subtitleField]) : null;
        const imageUrl = imageField !== undefined ? getImageUrl(item[imageField]) : null;
        return {
            id: item.id,
            label:
                getLabel?.(item, resource) ??
                (titleField !== undefined ? labelOf(item[titleField]) : null) ??
                item.id,
            ...(description !== null && description !== '' ? { description } : {}),
            ...(imageUrl !== null ? { imageUrl } : {}),
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
        describe(resource) {
            const definitionResource = resourceOf(resource);
            if (definitionResource === undefined) {
                return null;
            }
            return {
                ...(definitionResource.icon !== undefined ? { icon: definitionResource.icon } : {}),
                image: getItemImageField(definitionResource) !== undefined,
                description: definitionResource.itemSubtitle !== undefined,
            };
        },
    };
    if (getItemHref !== undefined) {
        source.getItemHref = getItemHref;
    }
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
            const { id, label, description, imageUrl } = entry as {
                id: unknown;
                label?: unknown;
                description?: unknown;
                imageUrl?: unknown;
            };
            if (typeof id === 'string' || typeof id === 'number') {
                return [
                    {
                        id: String(id),
                        label: typeof label === 'string' ? label : String(id),
                        ...(typeof description === 'string' ? { description } : {}),
                        ...(typeof imageUrl === 'string' ? { imageUrl } : {}),
                    },
                ];
            }
        }
        return [];
    });
}

interface ResolvedReferences {
    /** References by resource and id: `null` for ids that the source didn't find. */
    references: Map<string, RelationReference | null>;
    /** Requests in flight, so that fields with the same ids share one. */
    pending: Map<string, Promise<void>>;
}

const resolved = new WeakMap<RelationSource, ResolvedReferences>();

function resolvedOf(source: RelationSource): ResolvedReferences {
    let entry = resolved.get(source);
    if (entry === undefined) {
        entry = { references: new Map(), pending: new Map() };
        resolved.set(source, entry);
    }
    return entry;
}

const keyOf = (resource: string, id: string) => `${resource}\u0000${id}`;

/** Resolves the ids that no request has resolved or is resolving yet, and waits for all of them. */
function resolveIds(source: RelationSource, resource: string, ids: readonly string[]) {
    const { references, pending } = resolvedOf(source);
    const fresh = ids.filter((id) => !pending.has(keyOf(resource, id)));
    if (fresh.length > 0 && source.resolve !== undefined) {
        // Shared by every field that asks for these ids: it isn't aborted when one unmounts.
        const request = source
            .resolve(resource, fresh, { signal: new AbortController().signal })
            .then(
                (found) => {
                    fresh.forEach((id) =>
                        references.set(
                            keyOf(resource, id),
                            found.find((candidate) => candidate.id === id) ?? null,
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
 * Whether a reference needs `resolve()`: a plain id (its label is its id), or a reference without
 * the description or the image that the items of its resource have (decision 0067).
 */
function needsResolving(reference: RelationReference, detailed: boolean): boolean {
    return (
        reference.label === reference.id ||
        (detailed && reference.description === undefined && reference.imageUrl === undefined)
    );
}

/**
 * Relation references with what the source knows of them: plain ids (`"12"`) get their labels, and
 * references of a resource whose items have a description or an image (`describe()`) get them, from
 * the source's `resolve()`, once per source, resource and id. They stay as they are until then, or
 * when the source doesn't find them.
 */
export function useRelationReferences(
    source: RelationSource | null,
    resource: string,
    references: readonly RelationReference[],
): RelationReference[] {
    const cache = source !== null ? resolvedOf(source).references : null;
    const [found, setFound] = useState<Readonly<Record<string, RelationReference>>>({});
    const info = source?.describe?.(resource) ?? null;
    const detailed = info?.image === true || info?.description === true;
    const missing =
        source?.resolve !== undefined && cache !== null
            ? references
                  .filter((reference) => needsResolving(reference, detailed))
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
            const next: Record<string, RelationReference> = {};
            ids.forEach((id) => {
                const reference = cache.get(keyOf(resource, id));
                if (reference !== undefined && reference !== null) {
                    next[keyOf(resource, id)] = reference;
                }
            });
            setFound((current) => ({ ...current, ...next }));
        });
        return () => {
            active = false;
        };
    }, [source, cache, resource, missingKey]);

    return references.map((reference) => {
        if (!needsResolving(reference, detailed)) {
            return reference;
        }
        const known =
            found[keyOf(resource, reference.id)] ?? cache?.get(keyOf(resource, reference.id));
        if (known === undefined || known === null) {
            return reference;
        }
        // What the value says wins: its label, from the item that references it
        return {
            ...known,
            ...reference,
            label: reference.label === reference.id ? known.label : reference.label,
        };
    });
}
