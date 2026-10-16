import type { ListQuery } from '@panneau/protocol';
import { isFilterRange, matchesFilterRange } from '@panneau/protocol/runtime';

import type { ListColumn, ListItem } from './types';
import { getColumnValue, toText } from './values';

export interface LocalQueryOptions {
    /** The columns: values of localized fields are compared in `locale`. */
    columns?: readonly ListColumn[];
    /** Locale of localized values and of the text comparison. Defaults to `en`. */
    locale?: string;
}

export interface LocalQueryResult<T extends ListItem> {
    /** The items of the page. */
    items: T[];
    /** How many items match the filters and the search, on every page. */
    total: number;
}

function valueOf(item: ListItem, key: string, options: LocalQueryOptions): unknown {
    const column = options.columns?.find((candidate) => candidate.id === key);
    return column !== undefined ? getColumnValue(item, column, options.locale ?? 'en') : item[key];
}

/**
 * Applies a list query to items in memory, as a backend would: filters (the value, or one of the
 * values, matches as a string; a range matches the values within its bounds), search in every text
 * value, sort, then the page. For a product that has every item at hand.
 */
export function applyListQuery<T extends ListItem>(
    items: readonly T[],
    query: ListQuery,
    options: LocalQueryOptions = {},
): LocalQueryResult<T> {
    const locale = options.locale ?? 'en';
    let result = [...items];
    Object.entries(query.filter ?? {}).forEach(([key, expected]) => {
        if (isFilterRange(expected)) {
            result = result.filter((item) =>
                matchesFilterRange(valueOf(item, key, options), expected),
            );
            return;
        }
        const accepted = (Array.isArray(expected) ? expected : [expected]).map(String);
        result = result.filter((item) => {
            const value = valueOf(item, key, options);
            const values: unknown[] = Array.isArray(value) ? value : [value];
            return values.some((candidate) => {
                const id =
                    candidate !== null && typeof candidate === 'object' && 'id' in candidate
                        ? candidate.id
                        : candidate;
                return accepted.includes(String(id));
            });
        });
    });
    const q = query.q?.trim().toLocaleLowerCase(locale) ?? '';
    if (q !== '') {
        result = result.filter((item) =>
            Object.entries(item)
                .filter(([key]) => key !== 'id' && key !== 'abilities' && key !== 'version')
                .some(([key]) =>
                    toText(valueOf(item, key, options), locale)
                        .toLocaleLowerCase(locale)
                        .includes(q),
                ),
        );
    }
    const sort = query.sort ?? [];
    if (sort.length > 0) {
        const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
        result.sort((a, b) => {
            for (const part of sort) {
                const descending = part.startsWith('-');
                const key = descending ? part.slice(1) : part;
                const left = valueOf(a, key, options);
                const right = valueOf(b, key, options);
                const order =
                    typeof left === 'number' && typeof right === 'number'
                        ? left - right
                        : compareText(toText(left, locale), toText(right, locale), collator);
                if (order !== 0) {
                    return descending ? -order : order;
                }
            }
            return 0;
        });
    }
    const total = result.length;
    if (query.perPage !== undefined) {
        const page = query.page ?? 1;
        result = result.slice((page - 1) * query.perPage, page * query.perPage);
    }
    return { items: result, total };
}

/** Compares texts, empty ones last. */
function compareText(left: string, right: string, collator: Intl.Collator): number {
    if (left === right) {
        return 0;
    }
    if (left === '') {
        return 1;
    }
    if (right === '') {
        return -1;
    }
    return collator.compare(left, right);
}
