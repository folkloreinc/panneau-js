import { type FilterRange, type ListQuery, isFilterRange, toSearchParams } from './query';
import type { BreakdownWidgetData, SeriesWidgetData, StatWidgetData } from './schemas';
import { isRecord } from './values';
import {
    WIDGET_BREAKDOWN_MAX_ITEMS,
    WIDGET_SERIES_PERIODS,
    type WidgetSeriesPeriod,
} from './widgets';

/**
 * The most points of a `series` that `GET /resources/{resource}/aggregate` answers: a year of
 * days. A longer range keeps its latest periods.
 */
export const AGGREGATE_MAX_POINTS = 366;

/** The measure that counts the items, the default one. */
export const AGGREGATE_COUNT = 'count';

/** The aggregates a list declares (`list.aggregates`, decision 0084): nothing else is aggregated. */
export interface ListAggregatesLike {
    /** Fields that can be summed. */
    sum?: readonly string[] | undefined;
    /** Fields whose values the items can be grouped by. */
    groupBy?: readonly string[] | undefined;
    /** Date fields whose periods the items can be grouped by. */
    dates?: readonly string[] | undefined;
}

/** What is measured of the items: how many they are, or the sum of a field. */
export type AggregateMeasure = { type: 'count' } | { type: 'sum'; field: string };

/** How the items are grouped: by the period of a date, or by the values of a field. */
export type AggregateGroup =
    | { type: 'period'; period: WidgetSeriesPeriod; field: string }
    | { type: 'field'; field: string };

/** A query of the aggregate endpoint, read: its measure, and its group if it has one. */
export interface AggregateQuery {
    measure: AggregateMeasure;
    group: AggregateGroup | null;
}

/**
 * A request of `GET /resources/{resource}/aggregate`: the filters and the search of the list,
 * the `measure` (`count` by default) and the `group`.
 */
export interface AggregateRequest {
    filter?: ListQuery['filter'];
    q?: string | undefined;
    /** `count`, or `sum:{field}`. Defaults to `count`. */
    measure?: string | undefined;
    /** `{day|week|month}:{date field}`, or a field of `groupBy`. */
    group?: string | null | undefined;
}

/** The built-in widget type of an answer of the aggregate endpoint. */
export type AggregateWidgetType = 'stat' | 'series' | 'breakdown';

/** Reads a measure: `count`, or `sum:{field}`. `null` when it is neither. */
export function parseAggregateMeasure(value: string): AggregateMeasure | null {
    if (value === AGGREGATE_COUNT) {
        return { type: 'count' };
    }
    const field = /^sum:(.+)$/.exec(value)?.[1];
    return field !== undefined ? { type: 'sum', field } : null;
}

/**
 * Reads a group: `{period}:{date field}`, where the period is `day`, `week` or `month`, or the
 * name of a field. `null` when it is neither.
 */
export function parseAggregateGroup(value: string): AggregateGroup | null {
    const match = /^([^:]*):(.*)$/.exec(value);
    if (match === null) {
        return value !== '' ? { type: 'field', field: value } : null;
    }
    const [, period = '', field = ''] = match;
    return (WIDGET_SERIES_PERIODS as readonly string[]).includes(period) && field !== ''
        ? { type: 'period', period: period as WidgetSeriesPeriod, field }
        : null;
}

/** The shape of the answer to a group: a `stat` without one, a `series` or a `breakdown`. */
export function getAggregateWidgetType(group: AggregateGroup | null): AggregateWidgetType {
    if (group === null) {
        return 'stat';
    }
    return group.type === 'period' ? 'series' : 'breakdown';
}

/** Serializes a request of the aggregate endpoint: the filters and the search, then its own. */
export function toAggregateParams(request: AggregateRequest): URLSearchParams {
    const params = toSearchParams({
        ...(request.filter !== undefined && { filter: request.filter }),
        ...(request.q !== undefined && { q: request.q }),
    });
    params.set('measure', request.measure ?? AGGREGATE_COUNT);
    if (request.group !== undefined && request.group !== null && request.group !== '') {
        params.set('group', request.group);
    }
    return params;
}

/** An aggregate query as a backend reads it: valid, or the messages of its invalid parameters. */
export type ReadAggregateQueryResult =
    | { query: AggregateQuery; errors?: undefined }
    | { query?: undefined; errors: Record<string, string[]> };

/**
 * Reads `measure` and `group` of `GET /resources/{resource}/aggregate` against the aggregates of
 * the list: the reference of how a backend validates them. `measure` defaults to `count`; a
 * `sum:` names a field of `sum`, a period names a field of `dates`, and another group a field of
 * `groupBy`. Invalid parameters are a `422`, with `errors` keyed by parameter. The filters and the
 * search are read as the list reads them.
 */
export function readAggregateQuery(
    params: URLSearchParams,
    aggregates: ListAggregatesLike,
): ReadAggregateQueryResult {
    const errors: Record<string, string[]> = {};
    const rawMeasure = params.get('measure') ?? AGGREGATE_COUNT;
    const measure = parseAggregateMeasure(rawMeasure);
    if (measure === null) {
        errors.measure = ['The measure must be `count` or `sum:{field}`.'];
    } else if (measure.type === 'sum' && !(aggregates.sum ?? []).includes(measure.field)) {
        errors.measure = [`The field \`${measure.field}\` can't be summed.`];
    }

    const rawGroup = params.get('group');
    let group: AggregateGroup | null = null;
    if (rawGroup !== null) {
        group = parseAggregateGroup(rawGroup);
        if (group === null) {
            errors.group = ['The group must be `{day|week|month}:{date field}` or a field.'];
        } else if (group.type === 'period' && !(aggregates.dates ?? []).includes(group.field)) {
            errors.group = [`The field \`${group.field}\` isn't a date that can be grouped.`];
        } else if (group.type === 'field' && !(aggregates.groupBy ?? []).includes(group.field)) {
            errors.group = [`The items can't be grouped by the field \`${group.field}\`.`];
        }
    }

    if (Object.keys(errors).length > 0 || measure === null) {
        return { errors };
    }
    return { query: { measure, group } };
}

const DAY = /^\d{4}-\d{2}-\d{2}/;

/** The day of a `date` or `datetime` value, as the backend writes it: `null` without one. */
function dayOf(value: unknown): string | null {
    return typeof value === 'string' && DAY.test(value) ? value.slice(0, 10) : null;
}

function toUtc(day: string): Date {
    return new Date(`${day.slice(0, 10)}T00:00:00Z`);
}

function fromUtc(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * The first day of the period of a day: the day itself, the Monday of its week (ISO 8601), or the
 * first day of its month. `2026-10-08` is in the week of `2026-10-05`.
 */
export function startOfPeriod(day: string, period: WidgetSeriesPeriod): string {
    const date = toUtc(day);
    if (period === 'week') {
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    } else if (period === 'month') {
        date.setUTCDate(1);
    }
    return fromUtc(date);
}

/** The first day of the period after the one that starts on `start`. */
export function nextPeriod(start: string, period: WidgetSeriesPeriod): string {
    const date = toUtc(start);
    if (period === 'month') {
        date.setUTCMonth(date.getUTCMonth() + 1, 1);
    } else {
        date.setUTCDate(date.getUTCDate() + (period === 'week' ? 7 : 1));
    }
    return fromUtc(date);
}

/**
 * The first days of the periods from the one of `from` to the one of `to`, both included: at most
 * `max` of them, the latest. Empty when `to` is before `from`.
 */
export function listPeriods(
    from: string,
    to: string,
    period: WidgetSeriesPeriod,
    max: number = AGGREGATE_MAX_POINTS,
): string[] {
    const last = startOfPeriod(to, period);
    const periods: string[] = [];
    for (
        let start = startOfPeriod(from, period);
        start <= last;
        start = nextPeriod(start, period)
    ) {
        periods.push(start);
        if (periods.length > max) {
            periods.shift();
        }
    }
    return periods;
}

/** The fields an aggregate reads, as the definition declares them. */
export interface AggregateField {
    name: string;
    type: string;
    options?: readonly { value: unknown; label: string; tone?: string | undefined }[] | undefined;
}

export interface AggregateItemsOptions {
    /** The fields of the resource: the options of a `select` give the labels and the tones. */
    fields: readonly AggregateField[];
    /**
     * The bounds of the `date-range` filter of the query on the date of a period group, whose id is
     * the name of that field: the range of the series. Without a bound, the series starts on the
     * period of the first item, or ends on the period of the last.
     */
    range?: FilterRange | undefined;
    /** The label of the part of the items without a value. Defaults to `None`. */
    emptyLabel?: string;
}

/** The value of an item, as a key of a part: the id of a reference, `null` when it is empty. */
function keysOf(value: unknown): { key: string | number | boolean | null; label?: string }[] {
    if (Array.isArray(value)) {
        const keys = value.flatMap((entry) => keysOf(entry).filter(({ key }) => key !== null));
        return keys.length > 0 ? keys : [{ key: null }];
    }
    if (typeof value === 'string') {
        return [{ key: value === '' ? null : value }];
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return [{ key: value }];
    }
    // A reference to an item, of a `relation` (`{ "id", "label" }`)
    if (isRecord(value) && (typeof value.id === 'string' || typeof value.id === 'number')) {
        return [
            {
                key: value.id,
                ...(typeof value.label === 'string' && { label: value.label }),
            },
        ];
    }
    return [{ key: null }];
}

/** The amount of a value that is summed: a number, or the amount of a `money` value. */
function amountOf(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (isRecord(value) && typeof value.amount === 'number' && Number.isFinite(value.amount)) {
        return value.amount;
    }
    return 0;
}

/**
 * Aggregates items that a list query already filtered: the reference of what
 * `GET /resources/{resource}/aggregate` answers (decision 0084).
 *
 * - Without a group: a `stat`, the count or the sum of the items.
 * - By a period: a `series`, one point per period from its range, 0 for the periods without items.
 *   The range is the bounds of the `date-range` filter on the date (`range`), and without a bound,
 *   the period of the first or the last item; at most `AGGREGATE_MAX_POINTS` periods, the latest.
 *   Items without a date are left out. `total` is the sum of the points.
 * - By a field: a `breakdown`, a part per value, the largest first, at most
 *   `WIDGET_BREAKDOWN_MAX_ITEMS`, the rest in `other`. An item with several values counts in each
 *   of their parts, once in `total`; one without a value counts in the part of `key: null`. The
 *   options of a `select` give their labels and tones, a reference its `label`.
 *
 * A sum of `money` values adds their amounts, in minor units.
 */
export function aggregateItems(
    items: readonly Record<string, unknown>[],
    query: AggregateQuery,
    options: AggregateItemsOptions,
): StatWidgetData | SeriesWidgetData | BreakdownWidgetData {
    const { measure, group } = query;
    const measureOf = (item: Record<string, unknown>): number =>
        measure.type === 'count' ? 1 : amountOf(item[measure.field]);
    const total = items.reduce((sum, item) => sum + measureOf(item), 0);
    if (group === null) {
        return { value: total };
    }
    if (group.type === 'period') {
        const values = new Map<string, number>();
        const days: string[] = [];
        items.forEach((item) => {
            const day = dayOf(item[group.field]);
            if (day === null) {
                return;
            }
            days.push(day);
            const start = startOfPeriod(day, group.period);
            values.set(start, (values.get(start) ?? 0) + measureOf(item));
        });
        days.sort();
        const bound = (key: 'from' | 'to') => {
            const value = options.range?.[key];
            return value !== undefined && value !== '' ? dayOf(String(value)) : null;
        };
        const from = bound('from') ?? days[0] ?? bound('to');
        const to = bound('to') ?? days.at(-1) ?? bound('from');
        const points =
            from !== null && to !== null
                ? listPeriods(from, to, group.period).map((date) => ({
                      date,
                      value: values.get(date) ?? 0,
                  }))
                : [];
        return {
            period: group.period,
            points,
            total: points.reduce((sum, point) => sum + point.value, 0),
        };
    }
    const field = options.fields.find((candidate) => candidate.name === group.field);
    const parts = new Map<
        string,
        { key: string | number | boolean | null; label: string; value: number }
    >();
    items.forEach((item) => {
        const amount = measureOf(item);
        const seen = new Set<string>();
        keysOf(item[group.field]).forEach(({ key, label }) => {
            const id = JSON.stringify(key);
            if (seen.has(id)) {
                return;
            }
            seen.add(id);
            const part = parts.get(id) ?? {
                key,
                label: key === null ? (options.emptyLabel ?? 'None') : (label ?? String(key)),
                value: 0,
            };
            part.value += amount;
            parts.set(id, part);
        });
    });
    const optionOf = (key: unknown) =>
        field?.type === 'select'
            ? field.options?.find((option) => String(option.value) === String(key))
            : undefined;
    const order = (key: unknown) => {
        const index = field?.options?.findIndex((option) => String(option.value) === String(key));
        return index === undefined || index === -1 ? Infinity : index;
    };
    // The largest first; equal parts in the order of the options, then of their labels
    const sorted = [...parts.values()].sort(
        (a, b) =>
            b.value - a.value || order(a.key) - order(b.key) || a.label.localeCompare(b.label),
    );
    const shown = sorted.slice(0, WIDGET_BREAKDOWN_MAX_ITEMS);
    const rest = sorted.slice(WIDGET_BREAKDOWN_MAX_ITEMS);
    return {
        items: shown.map(({ key, label, value }) => {
            const option = key !== null ? optionOf(key) : undefined;
            return {
                label: option?.label ?? label,
                value,
                key,
                ...(option?.tone !== undefined && { tone: option.tone }),
            };
        }),
        total,
        ...(rest.length > 0 && { other: rest.reduce((sum, part) => sum + part.value, 0) }),
    };
}

/** The bounds of the `date-range` filter on a field in a list query, if it has them. */
export function getFilterRange(
    query: Pick<ListQuery, 'filter'>,
    field: string,
): FilterRange | undefined {
    const value = query.filter?.[field];
    return isFilterRange(value) ? value : undefined;
}
