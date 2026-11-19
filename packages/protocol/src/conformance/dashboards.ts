import { getAggregateWidgetType, parseAggregateGroup, toAggregateParams } from '../aggregates';
import {
    HOME_PAGE,
    getDashboardPages,
    getDashboardPeriod,
    getDashboardWidgets,
    getSummaryResources,
    getSummaryWidgets,
    toWidgetDataParams,
} from '../dashboards';
import { type WidgetPeriod, getDefaultPeriod, getPeriodRange } from '../periods';
import { type Definition, type Widget, widgetDataSchemas } from '../schemas';
import { ListResponse } from '../schemas/api';
import {
    WIDGET_LIST_MAX_ITEMS,
    followsPeriod,
    getWidgetAggregates,
    getWidgetResource,
    isBuiltInWidgetType,
    isCombinedWidget,
    readsResources,
} from '../widgets';
import { UNKNOWN } from './check';
import { type ConformanceRun } from './run';

/**
 * The dashboards and the summaries, and the period of an overview (decisions 0064 and 0084).
 */
export async function checkDashboards(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition } = ctx.state;

    // The dashboards and the summaries (decisions 0064 and 0084): the data of the widgets with data
    // of their own on each dashboard page and in the summary of each resource, the lists that feed
    // the widgets on a resource, and a widget that isn't on a page or in a summary.
    const dashboardPages = () => {
        const current = definition as Definition | null;
        return current !== null ? getDashboardPages(current) : [];
    };
    const summaryResources = () => {
        const current = definition as Definition | null;
        return current !== null ? getSummaryResources(current) : [];
    };
    /** Where a widget is: a dashboard page, or the summary of a resource. */
    type WidgetPlace =
        { page: string; resource?: undefined } | { resource: string; page?: undefined };
    const widgets = (): { place: WidgetPlace; widget: Widget }[] => [
        ...dashboardPages().flatMap((page) =>
            getDashboardWidgets(definition as Definition, page).map((widget) => ({
                place: { page },
                widget,
            })),
        ),
        ...summaryResources().flatMap((resource) =>
            getSummaryWidgets(definition as Definition, resource).map((widget) => ({
                place: { resource },
                widget,
            })),
        ),
    ];
    // The home page's widgets without `page`, as clients ask for them
    const widgetPath = (id: string, place: WidgetPlace & { period?: WidgetPeriod }) => {
        const search = toWidgetDataParams(place).toString();
        return `/dashboard/widgets/${encodeURIComponent(id)}${search !== '' ? `?${search}` : ''}`;
    };
    const placeName = (place: WidgetPlace) =>
        place.resource !== undefined
            ? `the summary of "${place.resource}"`
            : place.page !== HOME_PAGE
              ? `the page "${place.page}"`
              : 'the home page';
    const widgetName = (id: string, place: WidgetPlace) =>
        place.resource !== undefined || place.page !== HOME_PAGE
            ? `"${id}" of ${placeName(place)}`
            : `"${id}"`;

    await run(
        'dashboard.widgets',
        'GET /dashboard/widgets/{widget} answers each widget in the shape of its type',
        async (check) => {
            const own = widgets().filter(({ widget }) => !readsResources(widget));
            if (own.length === 0) {
                check.skip('No dashboard or summary has a widget with data of its own.');
                return;
            }
            for (const { place, widget } of own) {
                const name = widgetName(widget.id, place);
                const reply = await request(widgetPath(widget.id, place));
                // A widget the user can't see right now: the client hides it
                if (reply.status === 403) {
                    check.expectProblem(reply, 403);
                    continue;
                }
                if (
                    !check.expect(
                        reply.status === 200,
                        `Widget ${name}: expected status 200, got ${reply.status}.`,
                    )
                ) {
                    continue;
                }
                if (isBuiltInWidgetType(widget.type)) {
                    check.expectSchema(
                        widgetDataSchemas[widget.type],
                        reply.body,
                        `The data of the ${widget.type} ${name}`,
                    );
                } else {
                    check.expect(
                        reply.body !== null &&
                            typeof reply.body === 'object' &&
                            !Array.isArray(reply.body),
                        `The data of the widget ${name} must be an object.`,
                    );
                }
            }
        },
    );

    await run(
        'dashboard.widgets.resource',
        'The lists and the aggregates of the widgets on a resource answer their query, with a total for a stat',
        async (check) => {
            const onResource = widgets().flatMap(({ place, widget }) => {
                const read = getWidgetResource(widget);
                return read !== null && !isCombinedWidget(widget) ? [{ place, widget, read }] : [];
            });
            // The widgets that combine several aggregates (decision 0089): each of their reads
            const combined = widgets().flatMap(({ place, widget }) =>
                getWidgetAggregates(widget).map((read) => ({ place, widget, read })),
            );
            for (const { place, widget, read } of combined) {
                const name = widgetName(widget.id, place);
                const params = toAggregateParams({
                    ...(read.query.filter !== undefined && { filter: read.query.filter }),
                    ...(read.query.q !== undefined && { q: read.query.q }),
                    measure: read.measure,
                    group: read.group,
                });
                const reply = await request(
                    `/resources/${encodeURIComponent(read.resource)}/aggregate?${params.toString()}`,
                );
                if (reply.status === 403) {
                    check.expectProblem(reply, 403);
                    continue;
                }
                if (
                    !check.expect(
                        reply.status === 200,
                        `Widget ${name}: expected status 200 from the aggregate of "${read.resource}" (${read.role}), got ${reply.status}.`,
                    )
                ) {
                    continue;
                }
                const type = getAggregateWidgetType(
                    read.group !== null ? parseAggregateGroup(read.group) : null,
                );
                check.expectSchema(
                    widgetDataSchemas[type],
                    reply.body,
                    `The aggregate of the widget ${name} (${read.role} of "${read.resource}")`,
                );
            }
            if (onResource.length === 0 && combined.length === 0) {
                check.skip('No dashboard or summary has a widget on a resource.');
                return;
            }
            for (const { place, widget, read } of onResource) {
                const name = widgetName(widget.id, place);
                const reads = read.aggregate !== null ? 'aggregate' : 'list';
                const params =
                    read.aggregate !== null
                        ? toAggregateParams({ ...read.query, ...read.aggregate })
                        : new URLSearchParams(read.params);
                if (read.aggregate === null) {
                    params.set(
                        'perPage',
                        widget.type === 'stat' ? '1' : String(WIDGET_LIST_MAX_ITEMS),
                    );
                }
                const reply = await request(
                    `/resources/${encodeURIComponent(read.resource)}${read.aggregate !== null ? '/aggregate' : ''}?${params.toString()}`,
                );
                // A resource the user can't read: the client hides the widget
                if (reply.status === 403) {
                    check.expectProblem(reply, 403);
                    continue;
                }
                if (
                    !check.expect(
                        reply.status === 200,
                        `Widget ${name}: expected status 200 from its ${reads}, got ${reply.status}.`,
                    )
                ) {
                    continue;
                }
                if (read.aggregate !== null) {
                    const type = getAggregateWidgetType(
                        read.aggregate.group !== null
                            ? parseAggregateGroup(read.aggregate.group)
                            : null,
                    );
                    check.expect(
                        type === widget.type,
                        `The ${widget.type} ${name} reads aggregates in the shape of a ${type}.`,
                    );
                    check.expectSchema(
                        widgetDataSchemas[type],
                        reply.body,
                        `The aggregate of the widget ${name}`,
                    );
                    continue;
                }
                const list = check.expectSchema(
                    ListResponse,
                    reply.body,
                    `The list of the widget ${name}`,
                );
                if (list !== null && widget.type === 'stat') {
                    check.expect(
                        typeof (list.meta as { total?: unknown }).total === 'number',
                        `The list of the stat ${name} has no meta.total to count.`,
                    );
                }
            }
        },
    );

    // The period of an overview (decision 0084): the widgets with data of their own that follow it
    // answer with its parameters, and a wrong period is a 422.
    const placePeriod = (place: WidgetPlace) => {
        const current = definition as Definition;
        return place.resource !== undefined
            ? current.resources.find(({ id }) => id === place.resource)?.summary?.period
            : getDashboardPeriod(current, place.page);
    };
    await run(
        'dashboard.widgets.period',
        'GET /dashboard/widgets/{widget} answers the widgets that follow the period of their overview with its parameters',
        async (check) => {
            const following = widgets().flatMap(({ place, widget }) => {
                const period = placePeriod(place);
                const option = period !== undefined ? getDefaultPeriod(period) : null;
                return !readsResources(widget) &&
                    option !== null &&
                    followsPeriod(widget, place.resource)
                    ? [{ place, widget, period: { option, ...getPeriodRange(option) } }]
                    : [];
            });
            const first = following[0];
            if (first === undefined) {
                check.skip(
                    'No dashboard or summary with a period has a widget with data of its own that follows it.',
                );
                return;
            }
            for (const { place, widget, period } of following) {
                const name = widgetName(widget.id, place);
                const reply = await request(widgetPath(widget.id, { ...place, period }));
                if (reply.status === 403) {
                    check.expectProblem(reply, 403);
                    continue;
                }
                if (
                    check.expect(
                        reply.status === 200,
                        `Widget ${name} for the period ${period.option}: expected status 200, got ${reply.status}.`,
                    ) &&
                    isBuiltInWidgetType(widget.type)
                ) {
                    check.expectSchema(
                        widgetDataSchemas[widget.type],
                        reply.body,
                        `The data of the ${widget.type} ${name} for the period ${period.option}`,
                    );
                }
            }
            const wrong = await request(
                `${widgetPath(first.widget.id, first.place)}${first.place.resource !== undefined || first.place.page !== HOME_PAGE ? '&' : '?'}period%5Boption%5D=decade&period%5Bfrom%5D=2026-01-01&period%5Bto%5D=2026-12-31`,
            );
            if (
                check.expect(
                    wrong.status === 422,
                    `Widget ${widgetName(first.widget.id, first.place)} for the period "decade": expected status 422, got ${wrong.status}.`,
                )
            ) {
                check.expectProblem(wrong, 422);
            }
        },
    );

    await run(
        'dashboard.widgets.unknown',
        'A widget that is not on a dashboard page or in a summary of the user is a 404 problem',
        async (check) => {
            const pages = dashboardPages();
            const summaries = summaryResources();
            if (pages.length === 0 && summaries.length === 0) {
                check.skip('The definition has no dashboard and no summary.');
                return;
            }
            const expectStatus = async (path: string, what: string, status: 404 | 422) => {
                const reply = await request(path);
                if (
                    check.expect(
                        reply.status === status,
                        `${what}: expected status ${status}, got ${reply.status}.`,
                    )
                ) {
                    check.expectProblem(reply, status);
                }
            };
            const expectMissing = (path: string, what: string) => expectStatus(path, what, 404);
            const places: WidgetPlace[] = [
                ...pages.map((page) => ({ page })),
                ...summaries.map((resource) => ({ resource })),
            ];
            for (const place of places) {
                await expectMissing(
                    widgetPath(UNKNOWN, place),
                    `An unknown widget of ${placeName(place)}`,
                );
            }
            // Page by page and summary by summary (decision 0084): a widget asked for on a page that
            // doesn't exist, or on another dashboard page or summary than its own. Widgets with
            // data of their own first: the others are a 404 anywhere.
            const all = widgets().sort(
                (a, b) => Number(readsResources(a.widget)) - Number(readsResources(b.widget)),
            );
            const first = all[0];
            if (first === undefined) {
                return;
            }
            // A widget is on a page or in a summary: both are a 422
            const summarized = all.find(
                ({ place, widget }) => place.resource !== undefined && !readsResources(widget),
            );
            if (summarized?.place.resource !== undefined) {
                await expectStatus(
                    `${widgetPath(summarized.widget.id, summarized.place)}&page=${HOME_PAGE}`,
                    `Widget ${widgetName(summarized.widget.id, summarized.place)} with both a page and a resource`,
                    422,
                );
            }
            if (places.length === 1 && first.place.page === HOME_PAGE) {
                return;
            }
            await expectMissing(
                `/dashboard/widgets/${encodeURIComponent(first.widget.id)}?page=${UNKNOWN}`,
                `Widget ${widgetName(first.widget.id, first.place)} on an unknown page`,
            );
            for (const place of places) {
                const ids = new Set(
                    (place.resource !== undefined
                        ? getSummaryWidgets(definition as Definition, place.resource)
                        : getDashboardWidgets(definition as Definition, place.page)
                    ).map(({ id }) => id),
                );
                const elsewhere = all.find(({ widget }) => !ids.has(widget.id));
                if (elsewhere !== undefined) {
                    await expectMissing(
                        widgetPath(elsewhere.widget.id, place),
                        `Widget ${widgetName(elsewhere.widget.id, elsewhere.place)} on ${placeName(place)}`,
                    );
                }
            }
        },
    );
}
