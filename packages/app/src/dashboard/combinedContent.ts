import type { UseQueryResult } from '@tanstack/react-query';

import { can } from '@panneau/core';
import { ForbiddenError } from '@panneau/data';
import { type ResourceAggregateRead, useResourceAggregates } from '@panneau/data/query';
import type {
    BreakdownWidgetData,
    Definition,
    ListQuery,
    MetricWidgetData,
    Resource,
    SeriesPoint,
    SeriesWidgetData,
    SeriesWidgetSeries,
    StatWidgetData,
    TableWidgetCell,
    TableWidgetColumn,
    TableWidgetData,
    TableWidgetRow,
    Widget,
    WidgetNumberFormat,
} from '@panneau/protocol';
import {
    WIDGET_SOURCES_MAX,
    type WidgetAggregateRead,
    type WidgetListQuery,
    type WidgetPeriod,
    checkWidgetData,
    followsList,
    fromMinorUnits,
    getAggregateWidgetType,
    getChangeTone,
    getPreviousRange,
    getSummaryPeriodFilter,
    getWidgetAggregates,
    getWidgetChange,
    getWidgetSources,
    isCombinedWidget,
    parseAggregateGroup,
    readWidgetFormat,
} from '@panneau/protocol/runtime';

import { currencyOf, listHref, partsOf, withFilter } from './widgetHelpers';

/** What a combined widget draws: as `WidgetContent`, without importing it (a cycle). */
type CombinedContent =
    | { status: 'loading' }
    | { status: 'hidden' }
    | { status: 'error'; retry: () => void }
    | { status: 'ready'; data: unknown; currency?: string };

/** The texts that combined widgets write in their data: the headers of a table, "Other". */
export interface CombinedTexts {
    total: string;
    change: string;
    alerts: string;
    other: string;
}

/** A read of the aggregates, with the query it is made with. */
interface PlannedRead extends WidgetAggregateRead {
    /** The `date-range` filter that has the days of the period, `null` without one. */
    periodFilter: string | null;
    /** A read of the `value` over the previous period. */
    previous?: true;
}

interface UseCombinedContentOptions {
    widget: Widget;
    summary?: { resource: string; query: WidgetListQuery } | undefined;
    period: WidgetPeriod | null;
    definition: Definition;
    basePath: string;
    texts: CombinedTexts;
    enabled: boolean;
}

/** The request of the aggregate endpoint of a read. */
function requestOf(
    read: Pick<WidgetAggregateRead, 'resource' | 'query' | 'measure' | 'group'>,
): ResourceAggregateRead {
    return {
        resource: read.resource,
        request: {
            ...(read.query.filter !== undefined && { filter: read.query.filter }),
            ...(read.query.q !== undefined && { q: read.query.q }),
            measure: read.measure,
            group: read.group,
        },
    };
}

/** A query with the list's filters and search under its own (decision 0084). */
function withList(query: ListQuery, list: WidgetListQuery): ListQuery {
    const filter = { ...list.filter, ...query.filter };
    const q = query.q ?? list.q;
    return {
        ...query,
        ...(Object.keys(filter).length > 0 && { filter }),
        ...(q !== undefined && q !== '' && { q }),
    };
}

/** The data of an answer, checked against the shape of its group: `undefined` when it is wrong. */
function answerOf<T>(
    query: UseQueryResult<unknown> | undefined,
    group: string | null,
): T | undefined {
    const type = getAggregateWidgetType(group !== null ? parseAggregateGroup(group) : null);
    return query?.data !== undefined && checkWidgetData(type, query.data).length === 0
        ? (query.data as T)
        : undefined;
}

/** The amounts of a measure: major units of a sum of `money`, the value as is otherwise. */
function amountsOf(resource: Resource, measure: string) {
    const currency = currencyOf(resource, measure);
    const amount = (value: number) =>
        currency !== undefined ? fromMinorUnits(value, currency) : value;
    return { currency, amount };
}

const pointsWith = (points: SeriesPoint[], amount: (value: number) => number): SeriesPoint[] =>
    points.map((point) => ({ ...point, value: amount(point.value) }));

/**
 * The content of a widget that combines several aggregates of resources into one card (decision
 * 0089): a `metric` on a resource, a `series` with `split` or `sources`, a `table` with `rows`.
 * `null` for other widgets. Their reads are the static ones of `getWidgetAggregates()`, the
 * `value` of each source over the previous period when the overview has a period it follows, and
 * for a `split`, a line per value of its largest parts, once they are known. Sources on resources
 * the user can't list are left out, and a widget without any is hidden.
 */
export function useCombinedContent({
    widget,
    summary,
    period,
    definition,
    basePath,
    texts,
    enabled,
}: UseCombinedContentOptions): CombinedContent | null {
    const combined = isCombinedWidget(widget);
    const settings = widget.settings ?? {};
    const resourceOf = (id: string) =>
        definition.resources.find((candidate) => candidate.id === id);
    const canList = (id: string) => {
        const resource = resourceOf(id);
        return resource !== undefined && can(resource.abilities, 'viewAny');
    };
    const follows = summary !== undefined && followsList(widget, summary.resource);
    const summaryResource = summary !== undefined ? resourceOf(summary.resource) : undefined;
    const summaryFilter =
        summaryResource !== undefined ? getSummaryPeriodFilter(summaryResource) : null;

    const planned: PlannedRead[] = (combined ? getWidgetAggregates(widget) : [])
        .filter((read) => canList(read.resource))
        .map((read) => {
            const onSummary = follows && read.resource === summary?.resource;
            let query =
                onSummary && summary !== undefined
                    ? withList(read.query, summary.query)
                    : read.query;
            // In a summary, the period is the list's own filter, already in its query
            const periodFilter =
                typeof read.period === 'string'
                    ? read.period
                    : onSummary && read.period !== false
                      ? summaryFilter
                      : null;
            if (period !== null && typeof read.period === 'string') {
                query = withFilter(query, read.period, { from: period.from, to: period.to });
            }
            return { ...read, query, periodFilter };
        });
    const previousRange = period !== null ? getPreviousRange(period, period.option) : null;
    const previous: PlannedRead[] =
        previousRange !== null
            ? planned.flatMap((read) =>
                  read.role === 'value' && read.periodFilter !== null
                      ? [
                            {
                                ...read,
                                previous: true as const,
                                query: withFilter(read.query, read.periodFilter, previousRange),
                            },
                        ]
                      : [],
              )
            : [];
    const reads = [...planned, ...previous];
    const answers = useResourceAggregates(reads.map(requestOf), {
        enabled: enabled && combined && reads.length > 0,
    });
    const find = (role: PlannedRead['role'], source: number | null, isPrevious = false) => {
        const index = reads.findIndex(
            (read) =>
                read.role === role &&
                read.source === source &&
                (read.previous === true) === isPrevious,
        );
        const read = reads[index];
        return read !== undefined ? { read, answer: answers[index] } : undefined;
    };

    // A `split`: a line per value of its largest parts, filtered by it
    const split =
        widget.type === 'series' && typeof settings.split === 'string' ? settings.split : null;
    const splitParts = split !== null ? find('parts', null) : undefined;
    const splitBase = split !== null ? find('points', null)?.read : undefined;
    const splitData =
        splitParts !== undefined
            ? answerOf<BreakdownWidgetData>(splitParts.answer, splitParts.read.group)
            : undefined;
    const splitItems = (splitData?.items ?? [])
        .filter((item) => item.key !== undefined && item.key !== null)
        .slice(0, WIDGET_SOURCES_MAX);
    const splitReads =
        split !== null && splitBase !== undefined
            ? splitItems.map((item) => ({
                  ...splitBase,
                  query: withFilter(splitBase.query, split, String(item.key)),
              }))
            : [];
    const splitAnswers = useResourceAggregates(splitReads.map(requestOf), {
        enabled: enabled && splitReads.length > 0,
    });

    if (!combined) {
        return null;
    }
    if (planned.length === 0) {
        return { status: 'hidden' };
    }
    const all = [...answers, ...splitAnswers];
    if (all.some((query) => query.error instanceof ForbiddenError)) {
        return { status: 'hidden' };
    }
    const retry = () => {
        all.filter((query) => query.isError).forEach((query) => void query.refetch());
    };
    if (all.some((query) => query.data === undefined)) {
        return all.some((query) => query.isError)
            ? { status: 'error', retry }
            : { status: 'loading' };
    }
    const data = assemble();
    return data !== null ? { status: 'ready', ...data } : { status: 'error', retry };

    function assemble(): { data: unknown; currency?: string } | null {
        if (widget.type === 'metric') {
            return metric();
        }
        if (widget.type === 'table') {
            return table();
        }
        return split !== null ? splitSeries() : sourcesSeries();
    }

    function metric(): { data: MetricWidgetData; currency?: string } | null {
        const value = find('value', null);
        const resource = value !== undefined ? resourceOf(value.read.resource) : undefined;
        const stat = value !== undefined ? answerOf<StatWidgetData>(value.answer, null) : undefined;
        if (value === undefined || resource === undefined || stat === undefined) {
            return null;
        }
        const { currency, amount } = amountsOf(resource, value.read.measure);
        const before = find('value', null, true);
        const beforeStat =
            before !== undefined ? answerOf<StatWidgetData>(before.answer, null) : undefined;
        const trend = find('points', null);
        const series =
            trend !== undefined
                ? answerOf<SeriesWidgetData>(trend.answer, trend.read.group)
                : undefined;
        const parts = find('parts', null);
        const breakdown =
            parts !== undefined
                ? answerOf<BreakdownWidgetData>(parts.answer, parts.read.group)
                : undefined;
        if (
            (before !== undefined && beforeStat === undefined) ||
            (trend !== undefined && series === undefined) ||
            (parts !== undefined && breakdown === undefined)
        ) {
            return null;
        }
        const target =
            typeof settings.target === 'number' && settings.target > 0
                ? settings.target
                : undefined;
        return {
            data: {
                value: amount(stat.value),
                url: listHref(resource.id, value.read.query, basePath),
                ...(beforeStat !== undefined && { previous: amount(beforeStat.value) }),
                ...(target !== undefined && { target: amount(target) }),
                ...(series !== undefined && {
                    points: pointsWith(series.points, amount),
                    period: series.period,
                }),
                ...(breakdown !== undefined &&
                    parts !== undefined && {
                        parts: partsOf(breakdown, {
                            resource,
                            field: parts.read.group,
                            query: value.read.query,
                            basePath,
                            amount,
                        }),
                        other: typeof breakdown.other === 'number' ? amount(breakdown.other) : null,
                    }),
            },
            ...(currency !== undefined && { currency }),
        };
    }

    function splitSeries(): { data: SeriesWidgetData; currency?: string } | null {
        const total = find('points', null);
        const resource = total !== undefined ? resourceOf(total.read.resource) : undefined;
        const line =
            total !== undefined
                ? answerOf<SeriesWidgetData>(total.answer, total.read.group)
                : undefined;
        if (
            total === undefined ||
            resource === undefined ||
            line === undefined ||
            splitData === undefined ||
            split === null
        ) {
            return null;
        }
        const { currency, amount } = amountsOf(resource, total.read.measure);
        const parts = partsOf(
            { ...splitData, items: splitItems },
            { resource, field: split, query: total.read.query, basePath, amount },
        );
        const lines: SeriesWidgetSeries[] = [];
        for (const [index, part] of parts.entries()) {
            const answer = answerOf<SeriesWidgetData>(splitAnswers[index], total.read.group);
            if (answer === undefined) {
                return null;
            }
            lines.push({
                key: part.key ?? null,
                label: part.label,
                ...(part.tone !== undefined && part.tone !== null && { tone: part.tone }),
                ...(part.url !== undefined && part.url !== null && { url: part.url }),
                points: pointsWith(answer.points, amount),
                total: amount(answer.total ?? 0),
            });
        }
        // The rest: what the largest parts leave of the total, per period
        const rest = (splitData.other ?? 0) > 0 || splitData.items.length > splitItems.length;
        if (rest && lines.length > 0) {
            const taken = new Map<string, number>();
            lines.forEach((entry) =>
                entry.points.forEach((point) =>
                    taken.set(point.date, (taken.get(point.date) ?? 0) + point.value),
                ),
            );
            const points = line.points.map((point) => ({
                date: point.date,
                value: Math.max(0, amount(point.value) - (taken.get(point.date) ?? 0)),
            }));
            lines.push({
                label: texts.other,
                points,
                total: points.reduce((sum, point) => sum + point.value, 0),
            });
        }
        return {
            data: {
                period: line.period,
                points: pointsWith(line.points, amount),
                total: amount(line.total ?? 0),
                ...(lines.length > 0 && { series: lines }),
            },
            ...(currency !== undefined && { currency }),
        };
    }

    function sourcesSeries(): { data: SeriesWidgetData; currency?: string } | null {
        const sources = getWidgetSources(widget);
        const lines: SeriesWidgetSeries[] = [];
        const currencies = new Set<string | undefined>();
        let period: SeriesWidgetData['period'] | undefined;
        for (const [index, source] of sources.entries()) {
            const line = find('points', index);
            if (line === undefined) {
                // A source the user can't list
                continue;
            }
            const resource = resourceOf(source.resource);
            const answer = answerOf<SeriesWidgetData>(line.answer, line.read.group);
            const alert = find('alert', index);
            const count =
                alert !== undefined ? answerOf<StatWidgetData>(alert.answer, null) : undefined;
            if (
                resource === undefined ||
                answer === undefined ||
                (alert !== undefined && count === undefined)
            ) {
                return null;
            }
            const { currency, amount } = amountsOf(resource, source.measure);
            currencies.add(currency);
            period ??= answer.period;
            lines.push({
                label: source.label,
                points: pointsWith(answer.points, amount),
                total: amount(answer.total ?? 0),
                url: listHref(source.resource, line.read.query, basePath),
                ...(source.tone !== null && { tone: source.tone }),
                ...(source.help !== null && { help: source.help }),
                ...(count !== undefined &&
                    source.alert !== null && {
                        alert: {
                            value: count.value,
                            label: source.alert.label,
                            tone: source.alert.tone,
                        },
                    }),
            });
        }
        if (period === undefined) {
            return null;
        }
        // One currency for the chart, when every line has the same
        const [currency] = currencies.size === 1 ? [...currencies] : [undefined];
        return {
            data: { period, points: [], series: lines },
            ...(currency !== undefined && { currency }),
        };
    }

    function table(): { data: TableWidgetData } | null {
        const sources = getWidgetSources(widget);
        const format = readWidgetFormat(settings.format);
        const rows: TableWidgetRow[] = [];
        let hasChange = false;
        let hasAlert = false;
        let rowPeriod: TableWidgetData['period'];
        for (const [index, source] of sources.entries()) {
            const value = find('value', index);
            if (value === undefined) {
                continue;
            }
            const resource = resourceOf(source.resource);
            const stat = answerOf<StatWidgetData>(value.answer, null);
            const before = find('value', index, true);
            const beforeStat =
                before !== undefined ? answerOf<StatWidgetData>(before.answer, null) : undefined;
            const trend = find('points', index);
            const series =
                trend !== undefined
                    ? answerOf<SeriesWidgetData>(trend.answer, trend.read.group)
                    : undefined;
            const alert = find('alert', index);
            const count =
                alert !== undefined ? answerOf<StatWidgetData>(alert.answer, null) : undefined;
            if (
                resource === undefined ||
                stat === undefined ||
                (before !== undefined && beforeStat === undefined) ||
                (trend !== undefined && series === undefined) ||
                (alert !== undefined && count === undefined)
            ) {
                return null;
            }
            const { currency, amount } = amountsOf(resource, source.measure);
            // A sum of money in its currency, unless the widget says how to write its numbers
            const valueFormat: WidgetNumberFormat | undefined =
                format ?? (currency !== undefined ? { style: 'currency', currency } : undefined);
            const cells: Record<string, TableWidgetCell> = {
                value:
                    format === undefined && currency !== undefined
                        ? { value: amount(stat.value), format: { style: 'currency', currency } }
                        : amount(stat.value),
            };
            if (beforeStat !== undefined) {
                hasChange = true;
                const change = getWidgetChange(stat.value, beforeStat.value);
                const tone = getChangeTone(change.direction, settings.goodWhen);
                cells.change =
                    change.ratio !== null
                        ? { value: change.ratio, ...(tone !== null && { tone }) }
                        : {
                              value: amount(change.difference),
                              ...(tone !== null && { tone }),
                              format: { ...valueFormat, signDisplay: 'exceptZero' },
                          };
            }
            if (count !== undefined && source.alert !== null) {
                hasAlert = true;
                cells.alert = {
                    value: count.value,
                    help: source.alert.label,
                    ...(count.value > 0 && { tone: source.alert.tone }),
                };
            }
            rowPeriod ??= series?.period;
            rows.push({
                label: source.label,
                url: listHref(source.resource, value.read.query, basePath),
                cells,
                ...(series !== undefined && { points: pointsWith(series.points, amount) }),
            });
        }
        const columns: TableWidgetColumn[] = [
            { key: 'value', label: texts.total },
            ...(hasChange
                ? [
                      {
                          key: 'change',
                          label: texts.change,
                          format: {
                              style: 'percent' as const,
                              signDisplay: 'exceptZero' as const,
                              maximumFractionDigits: 0,
                          },
                      },
                  ]
                : []),
            ...(hasAlert
                ? [{ key: 'alert', label: texts.alerts, format: { maximumFractionDigits: 0 } }]
                : []),
        ];
        return {
            data: { columns, rows, ...(rowPeriod !== undefined && { period: rowPeriod }) },
        };
    }
}
