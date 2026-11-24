import { useEffect, useState } from 'react';

import type { Definition, Field, Item, ListQuery, Resource } from '@panneau/protocol';
import {
    IDS_FILTER,
    IDS_FILTER_LIMIT,
    getCreatableTypes,
    getImageUrl,
    getItemImageField,
    hasResourceTypes,
} from '@panneau/protocol/runtime';

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
    /**
     * Its state (Draft, Archived), shown as a badge in its tone: the related resource's
     * `itemStatus` (decision 0103).
     */
    status?: RelationStatus;
}

/** The state of a related item: the label of its `itemStatus`, and the tone of its option. */
export interface RelationStatus {
    label: string;
    /** A tone of the theme (`neutral`, `success`, `muted`…). Defaults to `neutral`. */
    tone?: string;
}

/** A page of results of `searchPage()`. */
export interface RelationSearchPage {
    items: RelationReference[];
    /** How many items match the text, when the source counts them. */
    total?: number | null;
    /** What `searchPage()` takes to get the next page: `null`, or left out, on the last one. */
    next?: string | null;
}

/** How a relation field shows the items of a resource, in its cards (decision 0067). */
export interface RelationResourceInfo {
    /** The name of the resource's icon, for items without an image. */
    icon?: string;
    /** Whether its items have an image (`itemImage`). */
    image?: boolean;
    /** Whether its items have a description (`itemSubtitle`). */
    description?: boolean;
    /** Whether its items have a status (`itemStatus`, decision 0103). */
    status?: boolean;
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
     * A page of the items of a resource that match a text, with how many there are: the picker
     * shows the first page, then asks for the `next` one as its list scrolls to the end. Without
     * it, the picker shows what `search()` gives, and no count.
     */
    searchPage?(
        resource: string,
        query: string,
        options: { signal: AbortSignal; next?: string | undefined },
    ): Promise<RelationSearchPage>;
    /**
     * The references of items by id, for values that are only ids (`"12"`, `["12", "13"]`), as a
     * product's own API gives them. In any order; ids it doesn't find are left out, and keep their
     * id as label. Without it, fields show the ids. Each field asks for its own ids: a source that
     * gets them from a backend groups the requests of the fields of a form (as
     * `createRelationSource()` does).
     */
    resolve?(
        resource: string,
        ids: readonly string[],
        options: { signal: AbortSignal },
    ): Promise<RelationReference[]>;
    /**
     * The reference of an item that the source already has, without a request: fields show it at
     * once, rather than its id until `resolve()` answers. `null` for an id that the source didn't
     * find, `undefined` for an id it doesn't know.
     */
    peek?(resource: string, id: string): RelationReference | null | undefined;
    /**
     * Creates an item from the text typed in the picker, which offers "Create “…”" when this
     * method exists. It can open a dialog, and resolves with the reference of the new item, or with
     * `null` when nothing was created.
     */
    create?(resource: string, text: string): Promise<RelationReference | null>;
    /** Whether `create()` can create items of a resource. Defaults to true. */
    canCreate?(resource: string): boolean;
    /**
     * How the items of a resource show in their cards: its icon, and whether they have an image, a
     * description or a status. When they do, references that come without them (`{ id, label }`,
     * from items) get them from `resolve()`.
     */
    describe?(resource: string): RelationResourceInfo | null;
    /** Where an item opens, for the link of its card. Without it, or `null`, the card has none. */
    getItemHref?(resource: string, id: string): string | null;
    /**
     * The links of cards open in a new tab, such as in a panel over a form, which a link would
     * leave (decision 0110).
     */
    linksInNewTab?: boolean;
    /**
     * Edits an item, such as in a panel with the form of its resource (decision 0110): its card
     * offers "Edit" when this method exists and `canEdit()` allows it. It resolves with the
     * reference of the item once it is saved, which the card shows at once, or with `null` when
     * nothing was saved.
     */
    edit?(resource: string, id: string): Promise<RelationReference | null>;
    /**
     * Whether the user can edit an item with `edit()`. Defaults to true. Fields ask `resolve()` for
     * the items they show, so that it knows them.
     */
    canEdit?(resource: string, id: string): boolean;
    /**
     * The reference of an item that `edit()` saved, newer than the one a value carries: fields show
     * it in its place. `undefined` for an item that wasn't edited.
     */
    edited?(resource: string, id: string): RelationReference | undefined;
}

/** What `createRelationSource()` needs from an adapter: the `list()` and `create()` of `@panneau/data`. */
export interface RelationListAdapter {
    /**
     * Searches items (`q`), page by page, and gets them by id (`filter[ids]`), for `resolve()`. Its
     * `meta`, when it gives one, says how many items match and whether there is a next page.
     */
    list(
        resource: string,
        query?: ListQuery,
        options?: { signal?: AbortSignal },
    ): Promise<{ data: Item[]; meta?: RelationListMeta }>;
    /** Creates an item, for `create()`. */
    create?(resource: string, values: Record<string, unknown>): Promise<Item>;
}

/** The `meta` of a page of a list, as `@panneau/protocol` gives it: by page numbers, or by cursors. */
export interface RelationListMeta {
    page?: number;
    lastPage?: number;
    total?: number | null;
    nextCursor?: string | null;
}

/**
 * Where `createRelationSource()` keeps the items it gets by id, such as the item queries of a
 * query client: `resolve()` only asks for the items it doesn't have, and adds those it gets.
 */
export interface RelationItemCache {
    get(resource: string, id: string): Item | undefined;
    set(resource: string, item: Item): void;
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
    /**
     * Creates the item in place of the adapter's `create()`, such as in a panel with the form of
     * its resource (decision 0110): it gets the values of the typed text, and resolves with the
     * new item, or `null` when nothing was created. It needs the `create` option.
     */
    createItem?: (resource: string, values: Record<string, unknown>) => Promise<Item | null>;
    /**
     * Edits an item somewhere, such as in a panel with the form of its resource (decision 0110):
     * it resolves with the item once it is saved, or `null` when nothing was saved. The cards of
     * the items that the user can update (`abilities.update`) then offer "Edit".
     */
    editItem?: (resource: string, id: string) => Promise<Item | null>;
    /** The links of cards open in a new tab (`linksInNewTab` of the source). */
    linksInNewTab?: boolean;
    /**
     * Where the items that `resolve()` gets are kept, such as the item queries of the app's query
     * client. Defaults to a cache of the source's own.
     */
    items?: RelationItemCache;
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

const keyOf = (resource: string, id: string) => `${resource}\u0000${id}`;

/** The fields of a resource and of its types, for the field of its `itemStatus`. */
function fieldOf(resource: Resource, name: string): Field | undefined {
    return [...resource.fields, ...(resource.types ?? []).flatMap((type) => type.fields)].find(
        (field) => field.name === name,
    );
}

/**
 * The status of an item, from the value of its resource's `itemStatus` field (decision 0103): the
 * label and the tone of its option for a `select` (its first value when it has several), or the
 * value as text.
 */
function statusOf(resource: Resource, item: Item): RelationStatus | null {
    const name = resource.itemStatus;
    if (name === undefined) {
        return null;
    }
    const raw: unknown = item[name];
    const value: unknown = Array.isArray(raw) ? raw[0] : raw;
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const option = fieldOf(resource, name)?.options?.find(
        (candidate) => String(candidate.value) === String(value),
    );
    if (option !== undefined) {
        return { label: option.label, ...(option.tone !== undefined ? { tone: option.tone } : {}) };
    }
    const label = labelOf(value);
    return label !== null && label !== '' ? { label } : null;
}

/** Reads the `next` of a page: a page number (`p:2`) or a cursor (`c:…`). */
function pageQuery(next: string | undefined): Pick<ListQuery, 'page' | 'cursor'> {
    if (next?.startsWith('c:') === true) {
        return { cursor: next.slice(2) };
    }
    const page = next?.startsWith('p:') === true ? Number(next.slice(2)) : 1;
    return { page: Number.isInteger(page) && page > 0 ? page : 1 };
}

/** The `total` and the `next` page of a list, from its `meta`. */
function pageOf(meta: RelationListMeta | undefined): Omit<RelationSearchPage, 'items'> {
    if (meta === undefined) {
        return {};
    }
    const total = typeof meta.total === 'number' ? meta.total : null;
    if ('nextCursor' in meta) {
        return { total, next: typeof meta.nextCursor === 'string' ? `c:${meta.nextCursor}` : null };
    }
    const { page, lastPage } = meta;
    return {
        total,
        next:
            typeof page === 'number' && typeof lastPage === 'number' && page < lastPage
                ? `p:${page + 1}`
                : null,
    };
}

/** A cache of items for the life of a relation source, without the `items` option. */
function createItemCache(): RelationItemCache {
    const items = new Map<string, Item>();
    return {
        get: (resource, id) => items.get(keyOf(resource, id)),
        set: (resource, item) => items.set(keyOf(resource, item.id), item),
    };
}

/** Splits ids into groups of at most `size`. */
function chunk(ids: readonly string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let start = 0; start < ids.length; start += size) {
        chunks.push(ids.slice(start, start + size));
    }
    return chunks;
}

/**
 * A relation source over an adapter, such as the `DataAdapter` of `@panneau/data`: a search is a
 * list query with `q`, and, with the `create` option, items are created with `create()`. Labels
 * come from the resource's `itemTitle`.
 *
 * `resolve()` gets the items it doesn't have yet with one list query on their ids
 * (`filter[ids]`, by groups of `IDS_FILTER_LIMIT`), for the ids that every field of a form asks
 * for at once, and keeps them in `items`. Its requests are shared by the fields that ask for the
 * same ids: one field's `signal` doesn't abort them.
 */
export function createRelationSource(
    adapter: RelationListAdapter,
    {
        definition = null,
        perPage = 20,
        getLabel,
        create,
        getItemHref,
        createItem: openCreate,
        editItem: openEdit,
        linksInNewTab = false,
        items = createItemCache(),
    }: RelationSourceOptions = {},
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
        const status = definitionResource !== undefined ? statusOf(definitionResource, item) : null;
        return {
            id: item.id,
            label:
                getLabel?.(item, resource) ??
                (titleField !== undefined ? labelOf(item[titleField]) : null) ??
                item.id,
            ...(description !== null && description !== '' ? { description } : {}),
            ...(imageUrl !== null ? { imageUrl } : {}),
            ...(status !== null ? { status } : {}),
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
    const searchPage = async (
        resource: string,
        query: string,
        { signal, next }: { signal: AbortSignal; next?: string | undefined },
    ): Promise<RelationSearchPage> => {
        const response = await adapter.list(
            resource,
            { ...pageQuery(next), perPage, ...(query !== '' ? { q: query } : {}) },
            { signal },
        );
        return {
            items: response.data.map((item) => toReference(item, resource)),
            ...pageOf(response.meta),
        };
    };
    const source: RelationSource = {
        async search(resource, query, { signal }) {
            return (await searchPage(resource, query, { signal })).items;
        },
        searchPage,
        describe(resource) {
            const definitionResource = resourceOf(resource);
            if (definitionResource === undefined) {
                return null;
            }
            return {
                ...(definitionResource.icon !== undefined ? { icon: definitionResource.icon } : {}),
                image: getItemImageField(definitionResource) !== undefined,
                description: definitionResource.itemSubtitle !== undefined,
                status: definitionResource.itemStatus !== undefined,
            };
        },
    };
    if (getItemHref !== undefined) {
        source.getItemHref = getItemHref;
    }
    if (linksInNewTab) {
        source.linksInNewTab = true;
    }

    // Ids that a list query on ids didn't return: the source doesn't ask for them again.
    const missing = new Set<string>();
    // Ids being asked for, and the request that answers them.
    const pending = new Map<string, Promise<void>>();
    // The ids of each resource waiting for the next request, which goes once every field has asked.
    const queued = new Map<string, { ids: string[]; sent: Promise<void> }>();

    const fetchIds = async (resource: string, ids: readonly string[]) => {
        await Promise.all(
            chunk(ids, IDS_FILTER_LIMIT).map((group) =>
                adapter
                    .list(resource, { filter: { [IDS_FILTER]: group }, perPage: group.length })
                    .then(
                        ({ data }) => {
                            data.filter((item) => group.includes(item.id)).forEach((item) =>
                                items.set(resource, item),
                            );
                            group
                                .filter((id) => items.get(resource, id) === undefined)
                                .forEach((id) => missing.add(keyOf(resource, id)));
                        },
                        () => {
                            // Asked for again the next time a field shows these ids.
                        },
                    ),
            ),
        );
        ids.forEach((id) => pending.delete(keyOf(resource, id)));
    };

    const request = (resource: string, ids: readonly string[]) => {
        const fresh = ids.filter(
            (id, index) =>
                ids.indexOf(id) === index &&
                items.get(resource, id) === undefined &&
                !missing.has(keyOf(resource, id)) &&
                !pending.has(keyOf(resource, id)),
        );
        if (fresh.length > 0) {
            let batch = queued.get(resource);
            if (batch === undefined) {
                const waiting: string[] = [];
                // After the fields that render together have asked for their ids.
                const sent = Promise.resolve().then(() => {
                    queued.delete(resource);
                    return fetchIds(resource, waiting);
                });
                batch = { ids: waiting, sent };
                queued.set(resource, batch);
            }
            const { ids: waiting, sent } = batch;
            waiting.push(...fresh);
            fresh.forEach((id) => pending.set(keyOf(resource, id), sent));
        }
        return Promise.all(ids.map((id) => pending.get(keyOf(resource, id))));
    };

    source.resolve = async (resource, ids) => {
        await request(resource, ids);
        return ids.flatMap((id) => {
            const item = items.get(resource, id);
            return item !== undefined ? [toReference(item, resource)] : [];
        });
    };
    source.peek = (resource, id) => {
        const item = items.get(resource, id);
        if (item !== undefined) {
            return toReference(item, resource);
        }
        return missing.has(keyOf(resource, id)) ? null : undefined;
    };

    const createItem =
        openCreate ??
        (adapter.create !== undefined
            ? (resource: string, values: Record<string, unknown>) =>
                  adapter.create?.(resource, values) ?? Promise.resolve(null)
            : undefined);
    if (create !== undefined && create !== false && createItem !== undefined) {
        // A resource with types creates one of them: not when none of them can be (decision 0077)
        source.canCreate = (resource) => {
            const definitionResource = resourceOf(resource);
            return (
                definitionResource?.abilities?.create !== false &&
                (definitionResource === undefined ||
                    !hasResourceTypes(definitionResource) ||
                    getCreatableTypes(definitionResource).length > 0) &&
                valuesOf('', resource) !== null
            );
        };
        source.create = async (resource, text) => {
            const values = valuesOf(text, resource);
            if (values === null) {
                return null;
            }
            const created = await createItem(resource, values);
            if (created === null) {
                return null;
            }
            // Its card shows at once, with its image and its description
            items.set(resource, created);
            return toReference(created, resource);
        };
    }
    if (openEdit !== undefined) {
        // The items saved by `edit()`: their cards show them as saved, rather than as values say
        const edited = new Set<string>();
        // As the rest of the app decides it: an item the user can update says so (decision 0046)
        source.canEdit = (resource, id) => items.get(resource, id)?.abilities.update === true;
        source.edit = async (resource, id) => {
            const saved = await openEdit(resource, id);
            if (saved === null) {
                return null;
            }
            items.set(resource, saved);
            edited.add(keyOf(resource, id));
            return toReference(saved, resource);
        };
        source.edited = (resource, id) => {
            const item = edited.has(keyOf(resource, id)) ? items.get(resource, id) : undefined;
            return item !== undefined ? toReference(item, resource) : undefined;
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
            const { id, label, description, imageUrl, status } = entry as {
                id: unknown;
                label?: unknown;
                description?: unknown;
                imageUrl?: unknown;
                status?: unknown;
            };
            const { label: statusLabel, tone } =
                status !== null && typeof status === 'object'
                    ? (status as { label?: unknown; tone?: unknown })
                    : {};
            if (typeof id === 'string' || typeof id === 'number') {
                return [
                    {
                        id: String(id),
                        label: typeof label === 'string' ? label : String(id),
                        ...(typeof description === 'string' ? { description } : {}),
                        ...(typeof imageUrl === 'string' ? { imageUrl } : {}),
                        ...(typeof statusLabel === 'string'
                            ? {
                                  status: {
                                      label: statusLabel,
                                      ...(typeof tone === 'string' ? { tone } : {}),
                                  },
                              }
                            : {}),
                    },
                ];
            }
        }
        return [];
    });
}

/**
 * Whether a reference needs `resolve()`: a plain id (its label is its id), or a reference without
 * the description, the image or the status that the items of its resource have (decisions 0067
 * and 0103).
 */
function needsResolving(reference: RelationReference, detailed: boolean): boolean {
    return (
        reference.label === reference.id ||
        (detailed &&
            reference.description === undefined &&
            reference.imageUrl === undefined &&
            reference.status === undefined)
    );
}

export interface RelationReferencesOptions {
    /**
     * Asks `resolve()` for every item that the source doesn't know yet, not only for plain ids and
     * incomplete references: for what only items say, such as whether they can be edited
     * (`canEdit()`).
     */
    resolveAll?: boolean;
}

/**
 * Relation references with what the source knows of them: plain ids (`"12"`) get their labels, and
 * references of a resource whose items have a description, an image or a status (`describe()`)
 * get them, from
 * the source: at once from `peek()`, or else from `resolve()`, once per field, resource and id.
 * They stay as they are until then, or when the source doesn't find them.
 */
export function useRelationReferences(
    source: RelationSource | null,
    resource: string,
    references: readonly RelationReference[],
    { resolveAll = false }: RelationReferencesOptions = {},
): RelationReference[] {
    // What `resolve()` answered for this source: `null` for ids it didn't find.
    const [resolved, setResolved] = useState<{
        source: RelationSource | null;
        references: Readonly<Record<string, RelationReference | null>>;
    }>({ source, references: {} });
    const found = resolved.source === source ? resolved.references : {};
    const info = source?.describe?.(resource) ?? null;
    const detailed = info?.image === true || info?.description === true || info?.status === true;
    const knownOf = (id: string): RelationReference | null | undefined => {
        const key = keyOf(resource, id);
        return key in found ? found[key] : source?.peek?.(resource, id);
    };
    const missing =
        source?.resolve !== undefined
            ? references
                  .filter((reference) => resolveAll || needsResolving(reference, detailed))
                  .map((reference) => reference.id)
                  .filter((id, index, ids) => ids.indexOf(id) === index)
                  .filter((id) => knownOf(id) === undefined)
            : [];
    const missingKey = missing.join('\u0000');

    useEffect(() => {
        const ids = missingKey === '' ? [] : missingKey.split('\u0000');
        if (source?.resolve === undefined || ids.length === 0) {
            return undefined;
        }
        const controller = new AbortController();
        source.resolve(resource, ids, { signal: controller.signal }).then(
            (answer) => {
                if (controller.signal.aborted) {
                    return;
                }
                const next = Object.fromEntries(
                    ids.map((id) => [
                        keyOf(resource, id),
                        answer.find((candidate) => candidate.id === id) ?? null,
                    ]),
                );
                setResolved((current) => ({
                    source,
                    references: {
                        ...(current.source === source ? current.references : {}),
                        ...next,
                    },
                }));
            },
            () => {
                // Asked for again the next time the field shows these ids.
            },
        );
        return () => controller.abort();
    }, [source, resource, missingKey]);

    return references.map((reference) => {
        if (!needsResolving(reference, detailed)) {
            return reference;
        }
        const known = knownOf(reference.id);
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
