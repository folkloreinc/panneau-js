import { type ListQuery, fromSearchParams } from './query';
import { isRecord } from './values';

/**
 * The widget types that every client draws (decisions 0064 and 0084). Other types are widgets of
 * plugins.
 */
export const BUILT_IN_WIDGET_TYPES = ['stat', 'series', 'list', 'breakdown'] as const;

export type BuiltInWidgetType = (typeof BUILT_IN_WIDGET_TYPES)[number];

/** The periods of the points of a `series` widget. */
export const WIDGET_SERIES_PERIODS = ['day', 'week', 'month'] as const;

export type WidgetSeriesPeriod = (typeof WIDGET_SERIES_PERIODS)[number];

/** The most items a `list` widget shows: the backend sends the most useful first. */
export const WIDGET_LIST_MAX_ITEMS = 5;

/** The most items of a `breakdown` widget: the rest is its `other`. */
export const WIDGET_BREAKDOWN_MAX_ITEMS = 10;

/**
 * The built-in types that can read a resource (`settings.resource`): `stat` and `list` read its
 * list, `series` and `breakdown` its aggregates, and a `stat` with a `sum:` measure too.
 */
export const RESOURCE_WIDGET_TYPES = ['stat', 'series', 'list', 'breakdown'] as const;

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
    if (!grouped && !(widget.type === 'stat' && sums)) {
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
    const params = new URLSearchParams();
    const query = widget.settings?.query;
    if (isRecord(query)) {
        Object.entries(query).forEach(([key, value]) => {
            if ((WIDGET_RESERVED_QUERY_PARAMS as readonly string[]).includes(key)) {
                return;
            }
            (Array.isArray(value) ? value : [value]).forEach((entry) => {
                if (
                    typeof entry === 'string' ||
                    typeof entry === 'number' ||
                    typeof entry === 'boolean'
                ) {
                    params.append(key, String(entry));
                }
            });
        });
    }
    return { resource, params, query: fromSearchParams(params), aggregate: aggregateOf(widget) };
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
    return wrong;
}

function checkSeries(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (!(WIDGET_SERIES_PERIODS as readonly unknown[]).includes(data.period)) {
        wrong.push('period');
    }
    if (!Array.isArray(data.points)) {
        wrong.push('points');
    } else {
        let previous = '';
        data.points.forEach((point: unknown, index) => {
            if (!isRecord(point)) {
                wrong.push(`points.${index}`);
                return;
            }
            if (!isString(point.date) || !DATE.test(point.date) || point.date <= previous) {
                wrong.push(`points.${index}.date`);
            } else {
                previous = point.date;
            }
            if (!isNumber(point.value)) {
                wrong.push(`points.${index}.value`);
            }
        });
    }
    if (!optional(data, 'total', isNumber)) {
        wrong.push('total');
    }
    return wrong;
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

function checkBreakdown(data: Record<string, unknown>): string[] {
    const wrong: string[] = [];
    if (!Array.isArray(data.items) || data.items.length > WIDGET_BREAKDOWN_MAX_ITEMS) {
        wrong.push('items');
    } else {
        data.items.forEach((item: unknown, index) => {
            if (!isRecord(item)) {
                wrong.push(`items.${index}`);
                return;
            }
            if (!isString(item.label)) {
                wrong.push(`items.${index}.label`);
            }
            if (!isNumber(item.value)) {
                wrong.push(`items.${index}.value`);
            }
            if (!optional(item, 'tone', isTone)) {
                wrong.push(`items.${index}.tone`);
            }
            if (!optional(item, 'url', isString)) {
                wrong.push(`items.${index}.url`);
            }
            if (!optional(item, 'key', isKey)) {
                wrong.push(`items.${index}.key`);
            }
        });
    }
    if (!optional(data, 'total', isNumber)) {
        wrong.push('total');
    }
    if (!optional(data, 'other', isNumber)) {
        wrong.push('other');
    }
    return wrong;
}

/**
 * Checks the data of a widget against the shape of its type (decisions 0064 and 0084), without the
 * schemas: the paths of the wrong keys (`value`, `points.2.date`), empty when it is right. The data
 * of a widget of a plugin only has to be an object. The dates of a series must go up, one point per
 * period.
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
        default:
            return [];
    }
}
