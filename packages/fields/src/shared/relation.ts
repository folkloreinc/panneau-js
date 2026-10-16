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
}

/** What `createRelationSource()` needs from an adapter: the `list()` of `@panneau/data`. */
export interface RelationListAdapter {
    list(
        resource: string,
        query?: ListQuery,
        options?: { signal?: AbortSignal },
    ): Promise<{ data: Item[] }>;
}

export interface RelationSourceOptions {
    /** The definition, for the field that titles the items of each resource (`itemTitle`). */
    definition?: Pick<Definition, 'resources'> | null;
    /** Items per search. Defaults to 20. */
    perPage?: number;
    /** The label of an item, when `itemTitle` isn't enough. */
    getLabel?: (item: Item, resource: string) => string;
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
 * A relation source over an adapter's `list()`, such as the `DataAdapter` of `@panneau/data`: a
 * search is a list query with `q`. Labels come from the resource's `itemTitle`.
 */
export function createRelationSource(
    adapter: RelationListAdapter,
    { definition = null, perPage = 20, getLabel }: RelationSourceOptions = {},
): RelationSource {
    return {
        async search(resource, query, { signal }) {
            const response = await adapter.list(
                resource,
                { page: 1, perPage, ...(query !== '' ? { q: query } : {}) },
                { signal },
            );
            const titleField = definition?.resources.find((r) => r.id === resource)?.itemTitle;
            return response.data.map((item) => ({
                id: item.id,
                label:
                    getLabel?.(item, resource) ??
                    (titleField !== undefined ? labelOf(item[titleField]) : null) ??
                    item.id,
            }));
        },
    };
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
