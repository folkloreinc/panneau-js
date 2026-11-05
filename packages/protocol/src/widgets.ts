import { type ListQuery, fromSearchParams } from './query';
import { isRecord } from './values';

/** The widget types that every client draws (decision 0064). Other types are widgets of plugins. */
export const BUILT_IN_WIDGET_TYPES = ['stat', 'series', 'list'] as const;

export type BuiltInWidgetType = (typeof BUILT_IN_WIDGET_TYPES)[number];

/** The periods of the points of a `series` widget. */
export const WIDGET_SERIES_PERIODS = ['day', 'week', 'month'] as const;

export type WidgetSeriesPeriod = (typeof WIDGET_SERIES_PERIODS)[number];

/** The most items a `list` widget shows: the backend sends the most useful first. */
export const WIDGET_LIST_MAX_ITEMS = 5;

/** The built-in types that can read the list of a resource (`settings.resource`). */
export const RESOURCE_WIDGET_TYPES = ['stat', 'list'] as const;

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

/** A built-in widget that reads the list of a resource, with no data of its own (decision 0064). */
export interface WidgetResource {
    /** The id of the resource. */
    resource: string;
    /** The `query` of the widget, as query parameters, without `page`, `perPage` and `cursor`. */
    params: URLSearchParams;
    /** The same query, parsed: the query of the list request, and of the link to the list. */
    query: ListQuery;
}

/**
 * The resource whose list feeds a built-in `stat` or `list` widget, and its query: `null` for a
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
    return { resource, params, query: fromSearchParams(params) };
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

/**
 * Checks the data of a widget against the shape of its type (decision 0064), without the schemas:
 * the paths of the wrong keys (`value`, `points.2.date`), empty when it is right. The data of a
 * widget of a plugin only has to be an object. The dates of a series must go up, one point per
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
        default:
            return [];
    }
}
