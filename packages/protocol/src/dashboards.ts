import { type WidgetPeriod, isDay, isOverviewPeriod } from './periods';
import { type ListQuery, fromSearchParams, toSearchParams } from './query';
import type { DefinitionInput, OverviewPeriod, ResourceInput, Widget } from './schemas';

/** The page whose dashboard is the home page, and the `page` of a widget request without one. */
export const HOME_PAGE = 'home';

/** The component of the built-in dashboard page. */
export const DASHBOARD_COMPONENT = 'dashboard';

/** The parts of a definition that declare dashboards: its pages, and `dashboard`. */
type DashboardsOf = Pick<DefinitionInput, 'pages' | 'dashboard'>;

/**
 * The widgets of the dashboard of a page, in order (decisions 0064 and 0084): the `widgets` of a
 * page whose component is the built-in `dashboard`. The home page is the dashboard of `pages.home`,
 * and `definition.dashboard` is its shorthand: its widgets are `pages.home.widgets` when set, else
 * those of `definition.dashboard`. Empty for any other page.
 */
export function getDashboardWidgets(definition: DashboardsOf, page: string = HOME_PAGE): Widget[] {
    const own = definition.pages?.[page];
    if (own?.component === DASHBOARD_COMPONENT && own.widgets !== undefined) {
        return own.widgets;
    }
    return page === HOME_PAGE ? (definition.dashboard?.widgets ?? []) : [];
}

/**
 * The pages that have a dashboard of widgets, home first: `home` when its widgets are declared
 * (`pages.home.widgets` or `definition.dashboard`), then each other page whose component is the
 * built-in `dashboard`, in the order of `pages`.
 */
export function getDashboardPages(definition: DashboardsOf): string[] {
    const home = definition.pages?.[HOME_PAGE];
    const hasHome =
        definition.dashboard !== undefined ||
        (home?.component === DASHBOARD_COMPONENT && home.widgets !== undefined);
    return [
        ...(hasHome ? [HOME_PAGE] : []),
        ...Object.entries(definition.pages ?? {})
            .filter(([id, page]) => id !== HOME_PAGE && page.component === DASHBOARD_COMPONENT)
            .map(([id]) => id),
    ];
}

/**
 * The period of the dashboard of a page (decision 0084): the `period` of a page whose component is
 * the built-in `dashboard`. For the home page, `pages.home.period` when set, else that of
 * `definition.dashboard`, its shorthand. `undefined` without one.
 */
export function getDashboardPeriod(
    definition: DashboardsOf,
    page: string = HOME_PAGE,
): OverviewPeriod | undefined {
    const own = definition.pages?.[page];
    if (own?.component === DASHBOARD_COMPONENT && own.period !== undefined) {
        return own.period;
    }
    return page === HOME_PAGE ? definition.dashboard?.period : undefined;
}

/**
 * The id of the list's `date-range` filter that the period of the summary of a resource sets
 * (decision 0084): its `period.filter`, or the first `date-range` filter of the list. `null`
 * without a period, or without such a filter.
 */
export function getSummaryPeriodFilter(
    resource: Pick<ResourceInput, 'summary' | 'list'>,
): string | null {
    const period = resource.summary?.period;
    if (period === undefined) {
        return null;
    }
    const filters = (resource.list?.filters ?? []).filter((filter) => filter.type === 'date-range');
    const id = period.filter ?? filters[0]?.id;
    return filters.some((filter) => filter.id === id) ? (id ?? null) : null;
}

/** The parts of a definition that declare summaries: its resources. */
type SummariesOf = Pick<DefinitionInput, 'resources'>;

/**
 * The widgets of the summary above the list of a resource, in order (decision 0084): its
 * `summary.widgets`. Empty for a resource without a summary, or that doesn't exist.
 */
export function getSummaryWidgets(definition: SummariesOf, resource: string): Widget[] {
    return (
        definition.resources.find((candidate) => candidate.id === resource)?.summary?.widgets ?? []
    );
}

/** The ids of the resources that have a summary above their list, in the order of `resources`. */
export function getSummaryResources(definition: SummariesOf): string[] {
    return definition.resources
        .filter((resource) => resource.summary !== undefined)
        .map((resource) => resource.id);
}

/** The query of a list that a widget of its summary gets: its filters and its search. */
export type WidgetListQuery = Pick<ListQuery, 'filter' | 'q'>;

/**
 * Where a widget with data of its own is asked for (decisions 0064 and 0084): on a dashboard page,
 * or in the summary of a resource, with the query of its list.
 */
export interface WidgetDataRequest {
    /** The id of the dashboard page of the widget, in `pages`. Defaults to `home`. */
    page?: string;
    /** The resource whose summary holds the widget. With it, `page` is left out. */
    resource?: string;
    /** In a summary: the filters and the search of the list, when the widget follows it. */
    query?: WidgetListQuery;
    /** The period chosen in the overview, unless the widget has `settings.period: false`. */
    period?: WidgetPeriod;
}

/** Writes the period of a widget: `period[option]`, `period[from]` and `period[to]`. */
function appendPeriod(params: URLSearchParams, period: WidgetPeriod | undefined): URLSearchParams {
    if (period !== undefined) {
        params.set('period[option]', period.option);
        params.set('period[from]', period.from);
        params.set('period[to]', period.to);
    }
    return params;
}

/**
 * The query parameters of `GET /dashboard/widgets/{widget}`: `resource` and the filters and search
 * of the list (`filter[…]`, `q`) for a widget of a summary, or `page` for a dashboard page other
 * than home, and the period of the overview (`period[option]`, `period[from]`, `period[to]`). The
 * widgets of the home page are asked for without `page`. The list's sort and paging are never
 * sent: `page` is the dashboard page.
 */
export function toWidgetDataParams(request: WidgetDataRequest = {}): URLSearchParams {
    if (request.resource !== undefined) {
        const params = new URLSearchParams({ resource: request.resource });
        toSearchParams({
            ...(request.query?.filter !== undefined && { filter: request.query.filter }),
            ...(request.query?.q !== undefined && { q: request.query.q }),
        }).forEach((value, key) => params.append(key, value));
        return appendPeriod(params, request.period);
    }
    const page = request.page ?? HOME_PAGE;
    return appendPeriod(new URLSearchParams(page !== HOME_PAGE ? { page } : {}), request.period);
}

/** What `readWidgetDataQuery()` reads: where the widget is, or the errors of its parameters. */
export type ReadWidgetDataQueryResult =
    | {
          page: string;
          resource?: undefined;
          query?: undefined;
          period: WidgetPeriod | null;
          errors?: undefined;
      }
    | {
          resource: string;
          query: WidgetListQuery;
          page?: undefined;
          period: WidgetPeriod | null;
          errors?: undefined;
      }
    | { errors: Record<string, string[]>; page?: undefined; resource?: undefined };

/**
 * The period of a request, from `period[option]`, `period[from]` and `period[to]`: `null` without
 * any, and an error when one is missing or wrong, or when `from` is after `to`.
 */
function readPeriod(params: URLSearchParams): WidgetPeriod | null | string {
    const option = params.get('period[option]');
    const from = params.get('period[from]');
    const to = params.get('period[to]');
    if (option === null && from === null && to === null) {
        return null;
    }
    if (!isOverviewPeriod(option)) {
        return 'The period must be one of 7d, 30d, 90d, month and year.';
    }
    if (!isDay(from) || !isDay(to) || from > to) {
        return 'The period needs its first and last days, from before to.';
    }
    return { option, from, to };
}

/**
 * Reads the query parameters of `GET /dashboard/widgets/{widget}` (decision 0084), as a backend
 * does: a widget of the summary of `resource`, with the filters and the search of its list, or of
 * the dashboard page `page`, `home` without it, and the period of the overview, or `null`. `page`
 * and `resource` together, an empty one, or a wrong period are errors keyed by `page`, `resource`
 * or `period`: a `422`.
 */
export function readWidgetDataQuery(params: URLSearchParams): ReadWidgetDataQueryResult {
    const page = params.get('page');
    const resource = params.get('resource');
    if (resource !== null && page !== null) {
        return { errors: { page: ['A widget is on a page or in a summary, not both.'] } };
    }
    if (resource === '') {
        return { errors: { resource: ['The resource must not be empty.'] } };
    }
    if (page === '') {
        return { errors: { page: ['The page must not be empty.'] } };
    }
    const period = readPeriod(params);
    if (typeof period === 'string') {
        return { errors: { period: [period] } };
    }
    if (resource !== null) {
        const { filter, q } = fromSearchParams(params);
        return {
            resource,
            query: { ...(filter !== undefined && { filter }), ...(q !== undefined && { q }) },
            period,
        };
    }
    return { page: page ?? HOME_PAGE, period };
}
