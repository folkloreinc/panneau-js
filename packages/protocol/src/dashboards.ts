import { type ListQuery, fromSearchParams, toSearchParams } from './query';
import type { DefinitionInput, Widget } from './schemas';

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
}

/**
 * The query parameters of `GET /dashboard/widgets/{widget}`: `resource` and the filters and search
 * of the list (`filter[…]`, `q`) for a widget of a summary, or `page` for a dashboard page other
 * than home. The widgets of the home page are asked for without any. The list's sort and paging
 * are never sent: `page` is the dashboard page.
 */
export function toWidgetDataParams(request: WidgetDataRequest = {}): URLSearchParams {
    if (request.resource !== undefined) {
        const params = new URLSearchParams({ resource: request.resource });
        toSearchParams({
            ...(request.query?.filter !== undefined && { filter: request.query.filter }),
            ...(request.query?.q !== undefined && { q: request.query.q }),
        }).forEach((value, key) => params.append(key, value));
        return params;
    }
    const page = request.page ?? HOME_PAGE;
    return new URLSearchParams(page !== HOME_PAGE ? { page } : {});
}

/** What `readWidgetDataQuery()` reads: where the widget is, or the errors of its parameters. */
export type ReadWidgetDataQueryResult =
    | { page: string; resource?: undefined; query?: undefined; errors?: undefined }
    | { resource: string; query: WidgetListQuery; page?: undefined; errors?: undefined }
    | { errors: Record<string, string[]>; page?: undefined; resource?: undefined };

/**
 * Reads the query parameters of `GET /dashboard/widgets/{widget}` (decision 0084), as a backend
 * does: a widget of the summary of `resource`, with the filters and the search of its list, or of
 * the dashboard page `page`, `home` without it. `page` and `resource` together, or empty, are
 * errors keyed by their name: a `422`.
 */
export function readWidgetDataQuery(params: URLSearchParams): ReadWidgetDataQueryResult {
    const page = params.get('page');
    const resource = params.get('resource');
    if (resource !== null && page !== null) {
        return { errors: { page: ['A widget is on a page or in a summary, not both.'] } };
    }
    if (resource !== null) {
        if (resource === '') {
            return { errors: { resource: ['The resource must not be empty.'] } };
        }
        const { filter, q } = fromSearchParams(params);
        return {
            resource,
            query: { ...(filter !== undefined && { filter }), ...(q !== undefined && { q }) },
        };
    }
    if (page === '') {
        return { errors: { page: ['The page must not be empty.'] } };
    }
    return { page: page ?? HOME_PAGE };
}
