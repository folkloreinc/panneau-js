import { isCurrencyCode } from './currencies';
import { type ListQuery, fromSearchParams } from './query';
import type { WidgetNumberFormat } from './schemas';
import { isRecord } from './values';

/**
 * The widget types that every client draws (decisions 0064 and 0084). Other types are widgets of
 * plugins.
 */
export const BUILT_IN_WIDGET_TYPES = [
    'stat',
    'series',
    'list',
    'breakdown',
    'metric',
    'table',
] as const;

export type BuiltInWidgetType = (typeof BUILT_IN_WIDGET_TYPES)[number];

/** The periods of the points of a `series` widget. */
export const WIDGET_SERIES_PERIODS = ['day', 'week', 'month'] as const;

export type WidgetSeriesPeriod = (typeof WIDGET_SERIES_PERIODS)[number];

/** The most items a `list` widget shows: the backend sends the most useful first. */
export const WIDGET_LIST_MAX_ITEMS = 5;

/** The most items of a `breakdown` widget: the rest is its `other`. */
export const WIDGET_BREAKDOWN_MAX_ITEMS = 10;

/** The parts of a `metric` that clients draw as bars: the rest goes in "Other" (decision 0089). */
export const WIDGET_METRIC_MAX_PARTS = 5;

/** The most lines of a `series` (decision 0089): 5 values of a field, and the rest. */
export const WIDGET_SERIES_MAX_SERIES = 6;

/**
 * The most lines a `series` on resources reads (decision 0089): its `sources`, or the values of
 * its `split`, past which the rest is one line, "Other".
 */
export const WIDGET_SOURCES_MAX = 5;

/** The most rows of a `table` widget, and of its `rows` on resources (decision 0089). */
export const WIDGET_TABLE_MAX_ROWS = 8;

/** The most columns of numbers of a `table` widget, after the column of the labels. */
export const WIDGET_TABLE_MAX_COLUMNS = 6;

/** How the columns of a `table` align their numbers: `end` by default. */
export const WIDGET_TABLE_ALIGNS = ['start', 'end'] as const;

/** Whether a rise or a fall of a `metric` or a `table` is good news (`settings.goodWhen`). */
export const WIDGET_GOOD_WHEN = ['up', 'down'] as const;

export type WidgetGoodWhen = (typeof WIDGET_GOOD_WHEN)[number];

/** The options of `Intl.NumberFormat` that a widget's `format` takes (decision 0089). */
export const WIDGET_FORMAT_STYLES = ['decimal', 'percent', 'currency', 'unit'] as const;
export const WIDGET_FORMAT_CURRENCY_DISPLAYS = ['symbol', 'narrowSymbol', 'code', 'name'] as const;
export const WIDGET_FORMAT_UNIT_DISPLAYS = ['short', 'narrow', 'long'] as const;
export const WIDGET_FORMAT_NOTATIONS = ['standard', 'compact'] as const;
export const WIDGET_FORMAT_SIGN_DISPLAYS = ['auto', 'always', 'exceptZero', 'never'] as const;

/**
 * The units of `Intl.NumberFormat` (the sanctioned units of ECMA-402): a widget's `format` takes
 * one, or two joined by `-per-` (`kilometer-per-hour`).
 */
export const WIDGET_FORMAT_UNITS = [
    'acre', 'bit', 'byte', 'celsius', 'centimeter', 'day', 'degree', 'fahrenheit', 'fluid-ounce',
    'foot', 'gallon', 'gigabit', 'gigabyte', 'gram', 'hectare', 'hour', 'inch', 'kilobit',
    'kilobyte', 'kilogram', 'kilometer', 'liter', 'megabit', 'megabyte', 'meter', 'microsecond',
    'mile', 'mile-scandinavian', 'milliliter', 'millimeter', 'millisecond', 'minute', 'month',
    'nanosecond', 'ounce', 'percent', 'petabyte', 'pound', 'second', 'stone', 'terabit',
    'terabyte', 'week', 'yard', 'year',
] as const; // prettier-ignore

/** Whether a string is a unit of `Intl.NumberFormat`, or two joined by `-per-`. */
export function isWidgetUnit(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    const parts = value.split('-per-');
    return (
        parts.length <= 2 &&
        parts.every((part) => (WIDGET_FORMAT_UNITS as readonly string[]).includes(part))
    );
}

/**
 * The built-in types that can read a resource (`settings.resource`): `stat` and `list` read its
 * list, `series`, `breakdown` and `metric` its aggregates, and a `stat` with a `sum:` measure too.
 */
export const RESOURCE_WIDGET_TYPES = ['stat', 'series', 'list', 'breakdown', 'metric'] as const;

/** The built-in types that read the aggregates of a resource, grouped by `settings.group`. */
export const GROUPED_WIDGET_TYPES = ['series', 'breakdown'] as const;

/** Query parameters that the client sets on the list of a widget on a resource, never `query`. */
export const WIDGET_RESERVED_QUERY_PARAMS = ['page', 'perPage', 'cursor'] as const;

export function isBuiltInWidgetType(type: string): type is BuiltInWidgetType {
    return (BUILT_IN_WIDGET_TYPES as readonly string[]).includes(type);
}

/** A widget as the helpers read it: the `Widget` of the definition, or one a backend writes. */
interface WidgetLike {
    type: string;
    settings?: Record<string, unknown> | undefined;
}

/** What a widget reads of `GET /resources/{resource}/aggregate` (decision 0084). */
export interface WidgetAggregate {
    /** `count`, or `sum:{field}`. */
    measure: string;
    /** `{period}:{date field}` or a field of `groupBy`, for a `series` or a `breakdown`. */
    group: string | null;
}

/**
 * A built-in widget that reads a resource, with no data of its own (decisions 0064 and 0084): its
 * list, or its aggregates.
 */
export interface WidgetResource {
    /** The id of the resource. */
    resource: string;
    /** The `query` of the widget, as query parameters, without `page`, `perPage` and `cursor`. */
    params: URLSearchParams;
    /** The same query, parsed: the query of the list request, and of the link to the list. */
    query: ListQuery;
    /**
     * The measure and the group of the aggregates the widget reads: a `series`, a `breakdown`, and
     * a `stat` with a `sum:` measure. `null` for a `list`, and a `stat` that counts the items of
     * the list (`meta.total`).
     */
    aggregate: WidgetAggregate | null;
}

/** The measure of a widget on a resource that reads its aggregates, or `null` for its list. */
function aggregateOf(widget: WidgetLike): WidgetAggregate | null {
    const measure = widget.settings?.measure;
    const group = widget.settings?.group;
    const grouped = (GROUPED_WIDGET_TYPES as readonly string[]).includes(widget.type);
    const sums = typeof measure === 'string' && measure.startsWith('sum:');
    if (!grouped && !(widget.type === 'stat' && sums) && widget.type !== 'metric') {
        return null;
    }
    return {
        measure: typeof measure === 'string' && measure !== '' ? measure : 'count',
        group: grouped && typeof group === 'string' && group !== '' ? group : null,
    };
}

/**
 * The resource that feeds a built-in widget, its query, and the aggregates it reads: `null` for a
 * widget with data of its own at `GET /dashboard/widgets/{widget}`, and for widgets of plugins.
 */
export function getWidgetResource(widget: WidgetLike): WidgetResource | null {
    const resource = widget.settings?.resource;
    if (
        !(RESOURCE_WIDGET_TYPES as readonly string[]).includes(widget.type) ||
        typeof resource !== 'string' ||
        resource === ''
    ) {
        return null;
    }
    const params = paramsOf(widget.settings?.query);
    return { resource, params, query: fromSearchParams(params), aggregate: aggregateOf(widget) };
}

/** The query of a widget or of a source, as query parameters, without the client's own. */
function paramsOf(query: unknown, into: URLSearchParams = new URLSearchParams()): URLSearchParams {
    if (isRecord(query)) {
        Object.entries(query).forEach(([key, value]) => {
            if ((WIDGET_RESERVED_QUERY_PARAMS as readonly string[]).includes(key)) {
                return;
            }
            // A key of the alert replaces the same key of its source
            into.delete(key);
            (Array.isArray(value) ? value : [value]).forEach((entry) => {
                if (
                    typeof entry === 'string' ||
                    typeof entry === 'number' ||
                    typeof entry === 'boolean'
                ) {
                    into.append(key, String(entry));
                }
            });
        });
    }
    return into;
}

/** The items of a source that call for attention, counted with its query and period. */
export interface WidgetSourceAlert {
    /** The query of the source with the alert's on top: the request, and the link to the list. */
    params: URLSearchParams;
    query: ListQuery;
    /** What they are, after their count: `failed`. */
    label: string;
    /** Their tone: `danger` by default. */
    tone: string;
}

/**
 * A source of a widget on several resources (decision 0089): a line of a `series` with
 * `settings.sources`, or a row of a `table` with `settings.rows`.
 */
export interface WidgetSource {
    resource: string;
    label: string;
    /** Its query, as query parameters, without `page`, `perPage` and `cursor`; and parsed. */
    params: URLSearchParams;
    query: ListQuery;
    /** `count`, or `sum:{field}`. */
    measure: string;
    /**
     * `{period}:{date field}`: the points of a line of a `series` (its `group`, or the widget's),
     * of the trend of a row of a `table` (its `points`, or the widget's). `null` without one.
     */
    group: string | null;
    /**
     * The `date-range` filter of its list that gets the period of the overview (its `period`, or
     * the widget's), `false` when it doesn't follow it, `null` when none is named.
     */
    period: string | false | null;
    /** A line under its label (a line of a `series`). */
    help: string | null;
    /** The tone of its line (a line of a `series`). */
    tone: string | null;
    alert: WidgetSourceAlert | null;
}

const stringOr = <T>(value: unknown, fallback: T): string | T =>
    typeof value === 'string' && value !== '' ? value : fallback;

/**
 * The sources of a widget on several resources (decision 0089): the `sources` of a `series`, at
 * most `WIDGET_SOURCES_MAX`, or the `rows` of a `table`, at most `WIDGET_TABLE_MAX_ROWS`. Each one
 * takes the `group` (`points` for a row) and the `period` of the widget when it has none. Empty for
 * other widgets.
 */
export function getWidgetSources(widget: WidgetLike): WidgetSource[] {
    const settings = widget.settings ?? {};
    const isSeries = widget.type === 'series' && Array.isArray(settings.sources);
    const isTable = widget.type === 'table' && Array.isArray(settings.rows);
    if (!isSeries && !isTable) {
        return [];
    }
    const entries = (isSeries ? settings.sources : settings.rows) as unknown[];
    const fallbackGroup = stringOr(isSeries ? settings.group : settings.points, null);
    const fallbackPeriod = settings.period === false ? false : stringOr(settings.period, null);
    return entries
        .slice(0, isSeries ? WIDGET_SOURCES_MAX : WIDGET_TABLE_MAX_ROWS)
        .flatMap((entry) => {
            if (!isRecord(entry) || typeof entry.resource !== 'string' || entry.resource === '') {
                return [];
            }
            const params = paramsOf(entry.query);
            const alert = isRecord(entry.alert) ? entry.alert : null;
            const alertParams =
                alert !== null ? paramsOf(alert.query, new URLSearchParams(params)) : null;
            return [
                {
                    resource: entry.resource,
                    label: stringOr(entry.label, entry.resource),
                    params,
                    query: fromSearchParams(params),
                    measure: stringOr(entry.measure, 'count'),
                    group: stringOr(isSeries ? entry.group : entry.points, fallbackGroup),
                    period: entry.period === false ? false : stringOr(entry.period, fallbackPeriod),
                    help: stringOr(entry.help, null),
                    tone: stringOr(entry.tone, null),
                    alert:
                        alert !== null && alertParams !== null
                            ? {
                                  params: alertParams,
                                  query: fromSearchParams(alertParams),
                                  label: stringOr(alert.label, ''),
                                  tone: stringOr(alert.tone, 'danger'),
                              }
                            : null,
                },
            ];
        });
}

/**
 * Whether a built-in widget reads resources rather than data of its own at
 * `GET /dashboard/widgets/{widget}`: `settings.resource`, or the `sources` of a `series` or the
 * `rows` of a `table` (decision 0089).
 */
export function readsResources(widget: WidgetLike): boolean {
    const settings = widget.settings ?? {};
    return (
        getWidgetResource(widget) !== null ||
        (widget.type === 'series' && Array.isArray(settings.sources)) ||
        (widget.type === 'table' && Array.isArray(settings.rows))
    );
}

/** What a read of the aggregates of a widget is for, when it combines several (decision 0089). */
export type WidgetAggregateRole =
    /** The number: of a `metric`, of a row of a `table`. */
    | 'value'
    /** A line of points: the trend of a `metric` or of a row, a line of a `series`, its total. */
    | 'points'
    /** The parts of a `metric` (`by`), the values of the `split` of a `series`. */
    | 'parts'
    /** The count of the alert of a source. */
    | 'alert';

/** A read of `GET /resources/{resource}/aggregate` that a combined widget makes. */
export interface WidgetAggregateRead {
    role: WidgetAggregateRole;
    /** The index of its source (`sources`, `rows`), `null` for the widget's own `resource`. */
    source: number | null;
    resource: string;
    /** The filters and the search of the widget or of its source. */
    query: ListQuery;
    measure: string;
    group: string | null;
    /** The `date-range` filter that gets the period of the overview, as for its source. */
    period: string | false | null;
}

/**
 * Whether a widget combines several reads of the aggregates of resources into one card (decision
 * 0089): a `metric` on a resource, a `series` with `split` or `sources`, a `table` with `rows`.
 */
export function isCombinedWidget(widget: WidgetLike): boolean {
    const settings = widget.settings ?? {};
    if (widget.type === 'metric') {
        return getWidgetResource(widget) !== null;
    }
    if (widget.type === 'series') {
        return (
            Array.isArray(settings.sources) ||
            (getWidgetResource(widget) !== null && stringOr(settings.split, null) !== null)
        );
    }
    return widget.type === 'table' && Array.isArray(settings.rows);
}

/**
 * The reads of the aggregates that a combined widget makes, whatever the period (decision 0089).
 * A client adds, with a period, the `value` of each source over the previous period, and for a
 * `split`, a line per value of its `parts`, filtered by it.
 *
 * - `metric`: its `value`, its `points` with `settings.points`, its `parts` with `settings.by`.
 * - `series` with `split`: its total line (`points`), and the `parts` of the field it splits by.
 * - `series` with `sources`: a line per source (`points`), and the count of its alert.
 * - `table` with `rows`: per row, its `value`, its `points`, and the count of its alert.
 */
export function getWidgetAggregates(widget: WidgetLike): WidgetAggregateRead[] {
    if (!isCombinedWidget(widget)) {
        return [];
    }
    const settings = widget.settings ?? {};
    const own = getWidgetResource(widget);
    const ownPeriod: string | false | null =
        settings.period === false ? false : stringOr(settings.period, null);
    if (own !== null && own.aggregate !== null) {
        const base = {
            source: null,
            resource: own.resource,
            query: own.query,
            measure: own.aggregate.measure,
            period: ownPeriod,
        };
        if (widget.type === 'metric') {
            const points = stringOr(settings.points, null);
            const by = stringOr(settings.by, null);
            return [
                { ...base, role: 'value', group: null },
                ...(points !== null ? [{ ...base, role: 'points' as const, group: points }] : []),
                ...(by !== null ? [{ ...base, role: 'parts' as const, group: by }] : []),
            ];
        }
        return [
            { ...base, role: 'points', group: own.aggregate.group },
            { ...base, role: 'parts', group: stringOr(settings.split, null) },
        ];
    }
    return getWidgetSources(widget).flatMap((source, index): WidgetAggregateRead[] => {
        const base = {
            source: index,
            resource: source.resource,
            query: source.query,
            measure: source.measure,
            period: source.period,
        };
        const alert =
            source.alert !== null
                ? [
                      {
                          ...base,
                          role: 'alert' as const,
                          query: source.alert.query,
                          measure: 'count',
                          group: null,
                      },
                  ]
                : [];
        if (widget.type === 'series') {
            return [{ ...base, role: 'points' as const, group: source.group }, ...alert];
        }
        return [
            { ...base, role: 'value' as const, group: null },
            ...(source.group !== null
                ? [{ ...base, role: 'points' as const, group: source.group }]
                : []),
            ...alert,
        ];
    });
}

/**
 * Whether a widget of the summary of a resource follows its list (decision 0084), and gets its
 * current filters and search: a widget on that resource, or with data of its own, unless its
 * `settings.followsList` is `false`. A widget on another resource doesn't.
 */
export function followsList(widget: WidgetLike, resource: string): boolean {
    if (widget.settings?.followsList === false) {
        return false;
    }
    if (!readsResources(widget)) {
        return true;
    }
    // A widget on several resources follows the list with its sources on it (decision 0089)
    return (
        getWidgetResource(widget)?.resource === resource ||
        getWidgetSources(widget).some((source) => source.resource === resource)
    );
}

/**
 * Whether a widget follows the period of its overview (decision 0084): a built-in widget on a
 * resource with `settings.period`, the list's `date-range` filter that gets its days; in the
 * summary of `summaryOf`, a widget that follows its list, whose `date-range` filter the period is;
 * and a widget with data of its own, which gets the period, unless `settings.period` is `false`.
 */
export function followsPeriod(widget: WidgetLike, summaryOf?: string): boolean {
    const period = widget.settings?.period;
    if (period === false) {
        return false;
    }
    return (
        !readsResources(widget) ||
        (typeof period === 'string' && period !== '') ||
        getWidgetSources(widget).some((source) => typeof source.period === 'string') ||
        (summaryOf !== undefined && followsList(widget, summaryOf))
    );
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TONE = /^[a-z0-9-]+$/;

const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

/** Whether a key is missing, `null`, or passes the check. */
function optional(
    data: Record<string, unknown>,
    key: string,
    check: (value: unknown) => boolean,
): boolean {
    return data[key] === undefined || data[key] === null || check(data[key]);
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isTone = (value: unknown): boolean => isString(value) && TONE.test(value);
const isKey = (value: unknown): boolean =>
    isString(value) || isNumber(value) || typeof value === 'boolean';

const ENUM_FORMAT_KEYS = {
    style: WIDGET_FORMAT_STYLES,
    currencyDisplay: WIDGET_FORMAT_CURRENCY_DISPLAYS,
    unitDisplay: WIDGET_FORMAT_UNIT_DISPLAYS,
    notation: WIDGET_FORMAT_NOTATIONS,
    signDisplay: WIDGET_FORMAT_SIGN_DISPLAYS,
} as const;

const isDigits = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 20;

/** The keys of a format that are wrong: an option out of its values, a style without its unit. */
function formatErrors(value: unknown): string[] {
    if (!isRecord(value)) {
        return [''];
    }
    const wrong = Object.entries(ENUM_FORMAT_KEYS)
        .filter(
            ([key, values]) => !optional(value, key, (entry) => values.includes(entry as never)),
        )
        .map(([key]) => key);
    if (!optional(value, 'currency', isCurrencyCode)) {
        wrong.push('currency');
    }
    if (!optional(value, 'unit', isWidgetUnit)) {
        wrong.push('unit');
    }
    ['minimumFractionDigits', 'maximumFractionDigits'].forEach((key) => {
        if (!optional(value, key, isDigits)) {
            wrong.push(key);
        }
    });
    if (value.style === 'currency' && !isCurrencyCode(value.currency)) {
        wrong.push('currency');
    }
    if (value.style === 'unit' && !isWidgetUnit(value.unit)) {
        wrong.push('unit');
    }
    if (
        isDigits(value.minimumFractionDigits) &&
        isDigits(value.maximumFractionDigits) &&
        value.minimumFractionDigits > value.maximumFractionDigits
    ) {
        wrong.push('minimumFractionDigits');
    }
    return [...new Set(wrong)];
}

/**
 * The format of the numbers of a widget (decision 0089): the options of `Intl.NumberFormat` among
 * those a widget takes, with valid values, or `undefined` without any. A style without its
 * `currency` or its `unit` is left out, as an unknown key. The `format` of the data, then the
 * `format` of the settings over it, key by key: `readWidgetFormat(data.format, settings.format)`.
 */
export function readWidgetFormat(...formats: unknown[]): WidgetNumberFormat | undefined {
    const merged: Record<string, unknown> = {};
    formats.forEach((format) => {
        if (isRecord(format)) {
            Object.assign(merged, format);
        }
    });
    const wrong = new Set(formatErrors(merged));
    const format: Record<string, unknown> = {};
    [
        ...Object.keys(ENUM_FORMAT_KEYS),
        'currency',
        'unit',
        'minimumFractionDigits',
        'maximumFractionDigits',
    ].forEach((key) => {
        if (merged[key] !== undefined && merged[key] !== null && !wrong.has(key)) {
            format[key] = merged[key];
        }
    });
    if (
        (format.style === 'currency' && format.currency === undefined) ||
        (format.style === 'unit' && format.unit === undefined)
    ) {
        delete format.style;
    }
    if (wrong.has('minimumFractionDigits')) {
        delete format.maximumFractionDigits;
    }
    return Object.keys(format).length > 0 ? (format as WidgetNumberFormat) : undefined;
}

function checkFormat(data: Record<string, unknown>, path = 'format'): string[] {
    return data[path] === undefined || data[path] === null
        ? []
        : formatErrors(data[path]).map((key) => (key === '' ? path : `${path}.${key}`));
}

/** The paths of the wrong points of a line: a date that doesn't go up, a value that isn't a number. */
function checkPoints(points: unknown, path: string): string[] {
    if (!Array.isArray(points)) {
        return [path];
    }
    const wrong: string[] = [];
    let previous = '';
    points.forEach((point: unknown, index) => {
        if (!isRecord(point)) {
            wrong.push(`${path}.${index}`);
            return;
        }
        if (!isString(point.date) || !DATE.test(point.date) || point.date <= previous) {
            wrong.push(`${path}.${index}.date`);
        } else {
            previous = point.date;
        }
        if (!isNumber(point.value)) {
            wrong.push(`${path}.${index}.value`);
        }
    });
    return wrong;
}

function checkStat(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (!isNumber(data.value)) {
        wrong.push('value');
    }
    if (!optional(data, 'help', isString)) {
        wrong.push('help');
    }
    if (!optional(data, 'tone', isTone)) {
        wrong.push('tone');
    }
    if (!optional(data, 'url', isString)) {
        wrong.push('url');
    }
    if (!optional(data, 'target', (value) => isNumber(value) && value > 0)) {
        wrong.push('target');
    }
    return [...wrong, ...checkFormat(data)];
}

function checkAlert(alert: unknown, path: string): string[] {
    if (alert === undefined || alert === null) {
        return [];
    }
    if (!isRecord(alert)) {
        return [path];
    }
    return [
        ...(!isNumber(alert.value) ? [`${path}.value`] : []),
        ...(!isString(alert.label) ? [`${path}.label`] : []),
        ...(!optional(alert, 'tone', isTone) ? [`${path}.tone`] : []),
    ];
}

function checkSeries(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (!(WIDGET_SERIES_PERIODS as readonly unknown[]).includes(data.period)) {
        wrong.push('period');
    }
    wrong.push(...checkPoints(data.points, 'points'));
    if (data.series !== undefined) {
        if (!Array.isArray(data.series) || data.series.length > WIDGET_SERIES_MAX_SERIES) {
            wrong.push('series');
        } else {
            data.series.forEach((series: unknown, index) => {
                const path = `series.${index}`;
                if (!isRecord(series)) {
                    wrong.push(path);
                    return;
                }
                if (!isString(series.label)) {
                    wrong.push(`${path}.label`);
                }
                wrong.push(...checkPoints(series.points, `${path}.points`));
                if (!optional(series, 'total', isNumber)) {
                    wrong.push(`${path}.total`);
                }
                if (!optional(series, 'tone', isTone)) {
                    wrong.push(`${path}.tone`);
                }
                ['url', 'help'].forEach((key) => {
                    if (!optional(series, key, isString)) {
                        wrong.push(`${path}.${key}`);
                    }
                });
                if (!optional(series, 'key', isKey)) {
                    wrong.push(`${path}.key`);
                }
                wrong.push(...checkAlert(series.alert, `${path}.alert`));
            });
        }
    }
    if (!optional(data, 'total', isNumber)) {
        wrong.push('total');
    }
    return [...wrong, ...checkFormat(data)];
}

function checkList(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (!Array.isArray(data.items) || data.items.length > WIDGET_LIST_MAX_ITEMS) {
        wrong.push('items');
    } else {
        data.items.forEach((item: unknown, index) => {
            if (!isRecord(item)) {
                wrong.push(`items.${index}`);
                return;
            }
            if (!isString(item.title)) {
                wrong.push(`items.${index}.title`);
            }
            ['description', 'meta', 'url'].forEach((key) => {
                if (!optional(item, key, isString)) {
                    wrong.push(`items.${index}.${key}`);
                }
            });
            const badge = item.badge;
            if (badge !== undefined && badge !== null) {
                if (!isRecord(badge) || !isString(badge.label)) {
                    wrong.push(`items.${index}.badge`);
                } else if (!optional(badge, 'tone', isTone)) {
                    wrong.push(`items.${index}.badge.tone`);
                }
            }
        });
    }
    if (!optional(data, 'empty', isString)) {
        wrong.push('empty');
    }
    if (!optional(data, 'url', isString)) {
        wrong.push('url');
    }
    return wrong;
}

/** The parts of a `breakdown` (`items`) or of a `metric` (`parts`). */
function checkParts(parts: unknown, path: string): string[] {
    if (!Array.isArray(parts) || parts.length > WIDGET_BREAKDOWN_MAX_ITEMS) {
        return [path];
    }
    const wrong: string[] = [];
    parts.forEach((item: unknown, index) => {
        if (!isRecord(item)) {
            wrong.push(`${path}.${index}`);
            return;
        }
        if (!isString(item.label)) {
            wrong.push(`${path}.${index}.label`);
        }
        if (!isNumber(item.value)) {
            wrong.push(`${path}.${index}.value`);
        }
        if (!optional(item, 'tone', isTone)) {
            wrong.push(`${path}.${index}.tone`);
        }
        if (!optional(item, 'url', isString)) {
            wrong.push(`${path}.${index}.url`);
        }
        if (!optional(item, 'key', isKey)) {
            wrong.push(`${path}.${index}.key`);
        }
    });
    return wrong;
}

function checkBreakdown(data: Record<string, unknown>): string[] {
    const wrong = checkParts(data.items, 'items');
    if (!optional(data, 'total', isNumber)) {
        wrong.push('total');
    }
    if (!optional(data, 'other', isNumber)) {
        wrong.push('other');
    }
    return [...wrong, ...checkFormat(data)];
}

function checkMetric(data: Record<string, unknown>): string[] {
    const wrong = checkStat(data);
    if (!optional(data, 'previous', isNumber)) {
        wrong.push('previous');
    }
    if (data.points !== undefined && data.points !== null) {
        wrong.push(...checkPoints(data.points, 'points'));
    }
    if (
        !optional(data, 'period', (value) =>
            (WIDGET_SERIES_PERIODS as readonly unknown[]).includes(value),
        )
    ) {
        wrong.push('period');
    }
    if (data.parts !== undefined && data.parts !== null) {
        wrong.push(...checkParts(data.parts, 'parts'));
    }
    if (!optional(data, 'other', isNumber)) {
        wrong.push('other');
    }
    return wrong;
}

const isCell = (cell: unknown): boolean =>
    cell === null ||
    isNumber(cell) ||
    (isRecord(cell) &&
        (cell.value === null || isNumber(cell.value)) &&
        optional(cell, 'tone', isTone) &&
        optional(cell, 'help', isString) &&
        checkFormat(cell).length === 0);

function checkTable(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (
        !Array.isArray(data.columns) ||
        data.columns.length === 0 ||
        data.columns.length > WIDGET_TABLE_MAX_COLUMNS
    ) {
        wrong.push('columns');
    } else {
        const keys = new Set<string>();
        data.columns.forEach((column: unknown, index) => {
            const path = `columns.${index}`;
            if (!isRecord(column)) {
                wrong.push(path);
                return;
            }
            if (!isString(column.key) || column.key === '' || keys.has(column.key)) {
                wrong.push(`${path}.key`);
            } else {
                keys.add(column.key);
            }
            if (!isString(column.label)) {
                wrong.push(`${path}.label`);
            }
            if (
                !optional(column, 'align', (value) =>
                    (WIDGET_TABLE_ALIGNS as readonly unknown[]).includes(value),
                )
            ) {
                wrong.push(`${path}.align`);
            }
            wrong.push(...checkFormat(column).map((key) => `${path}.${key}`));
        });
    }
    if (!Array.isArray(data.rows) || data.rows.length > WIDGET_TABLE_MAX_ROWS) {
        wrong.push('rows');
    } else {
        data.rows.forEach((row: unknown, index) => {
            const path = `rows.${index}`;
            if (!isRecord(row)) {
                wrong.push(path);
                return;
            }
            if (!isString(row.label)) {
                wrong.push(`${path}.label`);
            }
            if (!optional(row, 'url', isString)) {
                wrong.push(`${path}.url`);
            }
            if (!isRecord(row.cells)) {
                wrong.push(`${path}.cells`);
            } else {
                Object.entries(row.cells).forEach(([key, cell]) => {
                    if (!isCell(cell)) {
                        wrong.push(`${path}.cells.${key}`);
                    }
                });
            }
            if (row.points !== undefined && row.points !== null) {
                wrong.push(...checkPoints(row.points, `${path}.points`));
            }
        });
    }
    if (
        !optional(data, 'period', (value) =>
            (WIDGET_SERIES_PERIODS as readonly unknown[]).includes(value),
        )
    ) {
        wrong.push('period');
    }
    ['empty', 'url'].forEach((key) => {
        if (!optional(data, key, isString)) {
            wrong.push(key);
        }
    });
    return [...wrong, ...checkFormat(data)];
}

/**
 * Checks the data of a widget against the shape of its type (decisions 0064, 0084 and 0089),
 * without the schemas: the paths of the wrong keys (`value`, `points.2.date`), empty when it is
 * right. The data of a widget of a plugin only has to be an object. The dates of a series must go
 * up, one point per period.
 */
export function checkWidgetData(type: string, data: unknown): string[] {
    if (!isRecord(data)) {
        return [''];
    }
    switch (type) {
        case 'stat':
            return checkStat(data);
        case 'series':
            return checkSeries(data);
        case 'list':
            return checkList(data);
        case 'breakdown':
            return checkBreakdown(data);
        case 'metric':
            return checkMetric(data);
        case 'table':
            return checkTable(data);
        default:
            return [];
    }
}

const allZero = (points: unknown): boolean =>
    !Array.isArray(points) ||
    points.every((point: unknown) => !isRecord(point) || point.value === 0);

/**
 * Whether the data of a built-in widget has nothing to show (decision 0089), for
 * `settings.hideEmpty`: a `stat` at 0, a `metric` at 0 that was at 0 or has no previous value, a
 * `series` whose points are all 0, a `breakdown` whose parts and rest are all 0, a `list` without
 * items, a `table` without rows. Data of plugins is never empty.
 */
export function isWidgetDataEmpty(type: string, data: unknown): boolean {
    if (!isRecord(data)) {
        return false;
    }
    switch (type) {
        case 'stat':
            return data.value === 0;
        case 'metric':
            return data.value === 0 && (data.previous ?? 0) === 0;
        case 'series':
            return Array.isArray(data.series)
                ? data.series.every(
                      (series: unknown) => !isRecord(series) || allZero(series.points),
                  )
                : allZero(data.points);
        case 'breakdown':
            return allZero(data.items) && (data.other ?? 0) === 0;
        case 'list':
            return Array.isArray(data.items) && data.items.length === 0;
        case 'table':
            return Array.isArray(data.rows) && data.rows.length === 0;
        default:
            return false;
    }
}

/** The change of a number from the previous period (decision 0089). */
export interface WidgetChange {
    /** The value minus the previous one. */
    difference: number;
    /** The difference against the previous value (`0.12` for 12%): `null` when it was 0. */
    ratio: number | null;
    direction: 'up' | 'down' | 'none';
}

/** The change of a number from its value over the previous period (decision 0089). */
export function getWidgetChange(value: number, previous: number): WidgetChange {
    const difference = value - previous;
    return {
        difference,
        ratio: previous !== 0 ? difference / Math.abs(previous) : null,
        direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'none',
    };
}

/**
 * The tone of a change (decision 0089): `success` when it goes the way `goodWhen` says is good,
 * `danger` the other way, and none without `goodWhen` or without a change.
 */
export function getChangeTone(
    direction: WidgetChange['direction'],
    goodWhen: unknown,
): 'success' | 'danger' | null {
    if (direction === 'none' || (goodWhen !== 'up' && goodWhen !== 'down')) {
        return null;
    }
    return direction === goodWhen ? 'success' : 'danger';
}
