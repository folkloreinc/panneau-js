import { keepPreviousData } from '@tanstack/react-query';

import { can } from '@panneau/core';
import { ForbiddenError } from '@panneau/data';
import { useResourceAggregate, useResourceList, useWidgetData } from '@panneau/data/query';
import type {
    BreakdownWidgetData,
    Definition,
    Item,
    ListQuery,
    ListResponse,
    ListWidgetData,
    ListWidgetItem,
    Resource,
    SeriesWidgetData,
    StatWidgetData,
    Widget,
} from '@panneau/protocol';
import {
    WIDGET_LIST_MAX_ITEMS,
    type WidgetListQuery,
    type WidgetResource,
    checkWidgetData,
    followsList,
    fromMinorUnits,
    getWidgetResource,
    isBuiltInWidgetType,
    parseAggregateGroup,
    parseAggregateMeasure,
    toSearchParams,
} from '@panneau/protocol/runtime';

import { getItemPath } from '../pages/itemLinks';
import { getItemTitle } from '../pages/itemTitle';
import { routePath } from '../routes';

/**
 * What a widget of the dashboard draws: its skeleton, nothing, its error, or its data. A widget
 * that sums `money` of one currency has its `currency`: its values are amounts in that currency.
 */
export type WidgetContent =
    | { status: 'loading' }
    | { status: 'hidden' }
    | { status: 'error'; retry: () => void }
    | { status: 'ready'; data: unknown; currency?: string };

/** The link to the list of a resource, with the query of a widget on it. */
export function widgetListHref(read: WidgetResource, basePath: string): string {
    const search = read.params.toString();
    return `${routePath({ name: 'resource.index', resource: read.resource }, basePath)}${search !== '' ? `?${search}` : ''}`;
}

/** The badge of an item: the option of its value of the first `select` column of the list. */
function badgeOf(resource: Resource, item: Item): ListWidgetItem['badge'] {
    for (const column of resource.list?.columns ?? []) {
        const field = resource.fields.find(
            (candidate) => candidate.name === column.field && candidate.type === 'select',
        );
        if (field === undefined) {
            continue;
        }
        const raw = item[field.name];
        const value = Array.isArray(raw) ? (raw as unknown[])[0] : raw;
        const option = field.options?.find((candidate) => candidate.value === value);
        return option !== undefined
            ? { label: option.label, ...(option.tone !== undefined && { tone: option.tone }) }
            : null;
    }
    return null;
}

interface ResourceDataOptions {
    resource: Resource;
    read: WidgetResource;
    basePath: string;
    locale: string;
    untitled: (id: string) => string;
    /** `settings.target` of a `stat`. */
    target: number | undefined;
}

/** The target of a stat on a resource, from its settings. */
function targetOf(widget: Widget): number | undefined {
    const target = widget.settings?.target;
    return widget.type === 'stat' && typeof target === 'number' && target > 0 ? target : undefined;
}

/** The data of a built-in `stat` or `list` on a resource, from a page of its list. */
function fromList(
    type: string,
    list: ListResponse,
    { resource, read, basePath, locale, untitled, target }: ResourceDataOptions,
): StatWidgetData | ListWidgetData | null {
    const url = widgetListHref(read, basePath);
    if (type === 'stat') {
        const total = (list.meta as { total?: unknown }).total;
        // A list paged with cursors has no total to count
        return typeof total === 'number'
            ? { value: total, url, ...(target !== undefined && { target }) }
            : null;
    }
    return {
        items: list.data.slice(0, WIDGET_LIST_MAX_ITEMS).map((item) => ({
            title: getItemTitle(item, resource.itemTitle, locale) ?? untitled(item.id),
            url: getItemPath(resource, item, basePath),
            badge: badgeOf(resource, item),
        })),
        url,
    };
}

/** The currency of a sum of `money` of one currency: its amounts are in minor units. */
function currencyOf(resource: Resource, measure: string): string | undefined {
    const parsed = parseAggregateMeasure(measure);
    if (parsed?.type !== 'sum') {
        return undefined;
    }
    const field = resource.fields.find((candidate) => candidate.name === parsed.field);
    const currency = (field?.settings as { currency?: unknown } | undefined)?.currency;
    return field?.type === 'money' && typeof currency === 'string' ? currency : undefined;
}

/** The link of a bar of a breakdown: the list of the widget, filtered by the value of the bar. */
function partHref(
    read: WidgetResource,
    filter: string,
    key: string | number | boolean,
    basePath: string,
): string {
    const params = new URLSearchParams(read.params);
    [...params.keys()]
        .filter((name) => name === `filter[${filter}]` || name.startsWith(`filter[${filter}][`))
        .forEach((name) => params.delete(name));
    params.set(`filter[${filter}]`, String(key));
    return widgetListHref({ ...read, params }, basePath);
}

/**
 * The data of a widget on the aggregates of a resource (decision 0084), checked against the shape
 * of its type: a `stat` links to the list and gets its target, the bars of a `breakdown` of a
 * `select` take the labels and the tones of its options and link to the list filtered by their
 * value, when the list has a filter of that field. Sums of `money` are in major units.
 */
function fromAggregate(
    widget: Widget,
    raw: unknown,
    { resource, read, basePath, target }: ResourceDataOptions,
): { data: StatWidgetData | SeriesWidgetData | BreakdownWidgetData; currency?: string } | null {
    if (read.aggregate === null || checkWidgetData(widget.type, raw).length > 0) {
        return null;
    }
    const currency = currencyOf(resource, read.aggregate.measure);
    const amount = (value: number) =>
        currency !== undefined ? fromMinorUnits(value, currency) : value;
    const amountOrNull = (value: number | null | undefined) =>
        typeof value === 'number' ? amount(value) : value;
    const withCurrency = <T>(data: T) => ({
        data,
        ...(currency !== undefined && { currency }),
    });
    if (widget.type === 'stat') {
        const data = raw as StatWidgetData;
        return withCurrency({
            ...data,
            value: amount(data.value),
            url: widgetListHref(read, basePath),
            ...(target !== undefined && { target: amount(target) }),
        });
    }
    if (widget.type === 'series') {
        const data = raw as SeriesWidgetData;
        return withCurrency({
            ...data,
            points: data.points.map((point) => ({ ...point, value: amount(point.value) })),
            total: amountOrNull(data.total),
        });
    }
    const data = raw as BreakdownWidgetData;
    const group = read.aggregate.group !== null ? parseAggregateGroup(read.aggregate.group) : null;
    const name = group?.type === 'field' ? group.field : null;
    const field = resource.fields.find((candidate) => candidate.name === name);
    const filter = resource.list?.filters?.find(
        (candidate) => candidate.id === name && candidate.type !== 'date-range',
    );
    return withCurrency({
        ...data,
        items: data.items.map((item) => {
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
                    key !== null && { url: partHref(read, filter.id, key, basePath) }),
            };
        }),
        total: amountOrNull(data.total),
        other: amountOrNull(data.other),
    });
}

/**
 * A widget on a resource that follows its list (decision 0084): the list's filters and search, under
 * those of the widget's own query, which keep their meaning (a stat of the failed items stays one).
 */
function withListQuery(read: WidgetResource, list: WidgetListQuery): WidgetResource {
    const filter = { ...list.filter, ...read.query.filter };
    const q = read.query.q ?? list.q;
    const query: ListQuery = {
        ...read.query,
        ...(Object.keys(filter).length > 0 && { filter }),
        ...(q !== undefined && q !== '' && { q }),
    };
    return { ...read, query, params: toSearchParams(query) };
}

/** The summary of a resource that holds a widget, with the current query of its list. */
export interface WidgetSummary {
    resource: string;
    /** The filters and the search of the list, which the widgets that follow it get. */
    query: WidgetListQuery;
}

interface UseWidgetContentOptions {
    widget: Widget;
    /** The dashboard page of the widget: the home page without it, or a summary. */
    page?: string | undefined;
    /** The summary of a resource that holds the widget, instead of a page (decision 0084). */
    summary?: WidgetSummary | undefined;
    definition: Definition;
    basePath: string;
    /** The title of an item without one. */
    untitled: (id: string) => string;
    /** `false` for a type that nothing draws: its data isn't fetched. */
    enabled?: boolean;
}

/**
 * The content of a widget of the dashboard (decisions 0064 and 0084): the data of a widget with
 * data of its own, checked against the shape of its type, a `stat` or a `list` from the list of a
 * resource, or a `series`, a `breakdown` or a `stat` that sums from its aggregates. A widget the
 * user can't see (a `403`, a resource they can't list) is hidden.
 */
export function useWidgetContent({
    widget,
    page,
    summary,
    definition,
    basePath,
    untitled,
    enabled = true,
}: UseWidgetContentOptions): WidgetContent {
    const follows = summary !== undefined && followsList(widget, summary.resource);
    const own = getWidgetResource(widget);
    const read = own !== null && follows ? withListQuery(own, summary.query) : own;
    const resource =
        read !== null
            ? definition.resources.find((candidate) => candidate.id === read.resource)
            : undefined;
    const canList = resource !== undefined && can(resource.abilities, 'viewAny');
    const aggregate = read?.aggregate ?? null;
    const list = useResourceList(
        read?.resource ?? '',
        {
            ...read?.query,
            perPage: widget.type === 'stat' ? 1 : WIDGET_LIST_MAX_ITEMS,
        },
        {
            enabled: enabled && read !== null && aggregate === null && canList,
            // A widget that follows its list keeps its data while the next query loads
            placeholderData: keepPreviousData,
        },
    );
    const totals = useResourceAggregate(
        read?.resource ?? '',
        {
            ...(read?.query.filter !== undefined && { filter: read.query.filter }),
            ...(read?.query.q !== undefined && { q: read.query.q }),
            ...(aggregate !== null && { measure: aggregate.measure, group: aggregate.group }),
        },
        { enabled: enabled && aggregate !== null && canList },
    );
    const data = useWidgetData(widget.id, {
        ...(summary !== undefined
            ? { resource: summary.resource, ...(follows && { query: summary.query }) }
            : { page }),
        enabled: enabled && read === null,
        placeholderData: keepPreviousData,
    });
    const query = read === null ? data : aggregate !== null ? totals : list;
    if (read !== null && !canList) {
        return { status: 'hidden' };
    }
    if (query.error instanceof ForbiddenError) {
        return { status: 'hidden' };
    }
    const retry = () => void query.refetch();
    if (query.data === undefined) {
        return query.isError ? { status: 'error', retry } : { status: 'loading' };
    }
    if (read !== null && resource !== undefined) {
        const options = {
            resource,
            read,
            basePath,
            locale: definition.locale,
            untitled,
            target: targetOf(widget),
        };
        if (aggregate !== null) {
            const answer = fromAggregate(widget, totals.data, options);
            return answer !== null ? { status: 'ready', ...answer } : { status: 'error', retry };
        }
        const data = fromList(widget.type, list.data as ListResponse, options);
        return data !== null ? { status: 'ready', data } : { status: 'error', retry };
    }
    // Data in the wrong shape draws the error, not a broken widget
    if (isBuiltInWidgetType(widget.type) && checkWidgetData(widget.type, data.data).length > 0) {
        return { status: 'error', retry };
    }
    return { status: 'ready', data: data.data };
}
