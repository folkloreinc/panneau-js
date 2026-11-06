import type { ListQuery } from '@panneau/protocol';
import {
    IDS_FILTER,
    IDS_FILTER_LIMIT,
    isFilterRange,
    matchesFilterRange,
} from '@panneau/protocol/runtime';

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
 * What a value sorts by: the start of a date range (its end when it has none), the amount of money,
 * or the value itself (decision 0053).
 */
function sortValue(value: unknown): unknown {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    if ('start' in value && 'end' in value) {
        return value.start ?? value.end;
    }
    if ('currency' in value && 'amount' in value && typeof value.amount === 'number') {
        return value.amount;
    }
    return value;
}

/**
 * Applies a list query to items in memory, as a backend would: filters (the value, or one of the
 * values, matches as a string; a range matches the values within its bounds, and the date ranges
 * that overlap them), search in every text value, sort (a date range by its start, money by its
 * amount), then the page. For a product that has every item at hand.
 */
export function applyListQuery<T extends ListItem>(
    items: readonly T[],
    query: ListQuery,
    options: LocalQueryOptions = {},
): LocalQueryResult<T> {
    const locale = options.locale ?? 'en';
    let result = [...items];
    Object.entries(query.filter ?? {}).forEach(([key, expected]) => {
        // Every list filters on the ids of its items (decision 0069).
        if (key === IDS_FILTER) {
            const ids = (Array.isArray(expected) ? expected : [expected])
                .map(String)
                .slice(0, IDS_FILTER_LIMIT);
            result = result.filter((item) => ids.includes(item.id));
            return;
        }
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
                const left = sortValue(valueOf(a, key, options));
                const right = sortValue(valueOf(b, key, options));
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
