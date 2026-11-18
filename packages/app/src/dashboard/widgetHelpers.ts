import type {
    BreakdownWidgetData,
    BreakdownWidgetItem,
    ListQuery,
    Resource,
} from '@panneau/protocol';
import {
    type CurrencyCode,
    type WidgetResource,
    isCurrencyCode,
    parseAggregateMeasure,
    toSearchParams,
} from '@panneau/protocol/runtime';

import { routePath } from '../routes';

/** The link to the list of a resource, with the query of a widget on it. */
export function widgetListHref(
    read: Pick<WidgetResource, 'resource' | 'params'>,
    basePath: string,
): string {
    const search = read.params.toString();
    return `${routePath({ name: 'resource.index', resource: read.resource }, basePath)}${search !== '' ? `?${search}` : ''}`;
}

/** The link to the list of a resource with a query. */
export function listHref(resource: string, query: ListQuery, basePath: string): string {
    return widgetListHref({ resource, params: toSearchParams(query) }, basePath);
}

/** The currency of a sum of `money` of one currency: its amounts are in minor units. */
export function currencyOf(resource: Resource, measure: string): CurrencyCode | undefined {
    const parsed = parseAggregateMeasure(measure);
    if (parsed?.type !== 'sum') {
        return undefined;
    }
    const field = resource.fields.find((candidate) => candidate.name === parsed.field);
    const currency = (field?.settings as { currency?: unknown } | undefined)?.currency;
    return field?.type === 'money' && isCurrencyCode(currency) ? currency : undefined;
}

/** A query with one filter set to a value, in place of what it had on that filter. */
export function withFilter(query: ListQuery, filter: string, value: unknown): ListQuery {
    return { ...query, filter: { ...query.filter, [filter]: value as never } };
}

/**
 * The parts of a breakdown on a resource (decisions 0084 and 0089): the parts of a `select` take
 * the labels and the tones of its options, and each part links to the list of `query` filtered by
 * its value, when the list has a filter of that field. Their values pass through `amount`.
 */
export function partsOf(
    data: BreakdownWidgetData,
    {
        resource,
        field: name,
        query,
        basePath,
        amount = (value) => value,
    }: {
        resource: Resource;
        /** The field the parts are values of. */
        field: string | null;
        /** The query of the list the parts link to, filtered by their value. */
        query: ListQuery;
        basePath: string;
        amount?: (value: number) => number;
    },
): BreakdownWidgetItem[] {
    const field = resource.fields.find((candidate) => candidate.name === name);
    const filter = resource.list?.filters?.find(
        (candidate) => candidate.id === name && candidate.type !== 'date-range',
    );
    return data.items.map((item) => {
        const key = item.key;
        const option =
            field?.type === 'select' && key !== undefined && key !== null
                ? field.options?.find((candidate) => String(candidate.value) === String(key))
                : undefined;
        return {
            ...item,
            value: amount(item.value),
            ...(option !== undefined && {
                label: option.label,
                ...(option.tone !== undefined && { tone: option.tone }),
            }),
            ...(filter !== undefined &&
                key !== undefined &&
                key !== null && {
                    url: listHref(resource.id, withFilter(query, filter.id, String(key)), basePath),
                }),
        };
    });
}
