import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import {
    getDashboardPages,
    getDashboardWidgets,
    getSummaryResources,
    getSummaryWidgets,
    readWidgetDataQuery,
    toWidgetDataParams,
} from './dashboards';
import { createMockBackend } from './mock';
import type { DefinitionInput, Widget } from './schemas';
import { validateDefinition } from './validate';
import { followsList } from './widgets';

const HOME: Widget[] = [{ id: 'count', type: 'stat' }];
const ACTIVITY: Widget[] = [
    { id: 'signups', type: 'series' },
    { id: 'drafts', type: 'stat', settings: { resource: 'pages' } },
];

function withDashboards(overrides: Partial<DefinitionInput> = {}): DefinitionInput {
    return {
        ...createDefinition(),
        pages: {
            home: { component: 'dashboard' },
            activity: { component: 'dashboard', label: 'Activity', widgets: ACTIVITY },
            usage: { component: 'usage', label: 'Usage' },
        },
        dashboard: { widgets: HOME },
        ...overrides,
    };
}

const messages = (definition: DefinitionInput) => {
    const result = validateDefinition(definition);
    return result.success ? [] : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
};

describe('getDashboardWidgets', () => {
    it('reads the widgets of a dashboard page, and those of `dashboard` for the home page', () => {
        const definition = withDashboards();
        expect(getDashboardWidgets(definition)).toBe(HOME);
        expect(getDashboardWidgets(definition, 'home')).toBe(HOME);
        expect(getDashboardWidgets(definition, 'activity')).toBe(ACTIVITY);
    });

    it('prefers the widgets of `pages.home` to `dashboard`', () => {
        const own: Widget[] = [{ id: 'visits', type: 'series' }];
        const definition = withDashboards({
            pages: { home: { component: 'dashboard', widgets: own } },
            dashboard: { widgets: [] },
        });
        expect(getDashboardWidgets(definition)).toBe(own);
    });

    it('is empty for a page that is not a dashboard, or that does not exist', () => {
        const definition = withDashboards({
            pages: {
                usage: { component: 'usage', widgets: ACTIVITY },
                empty: { component: 'dashboard' },
            },
        });
        expect(getDashboardWidgets(definition, 'usage')).toEqual([]);
        expect(getDashboardWidgets(definition, 'empty')).toEqual([]);
        expect(getDashboardWidgets(definition, 'nope')).toEqual([]);
        expect(getDashboardWidgets(createDefinition())).toEqual([]);
    });
});

describe('getDashboardPages', () => {
    it('lists the home page with widgets, then the other dashboard pages', () => {
        expect(getDashboardPages(withDashboards())).toEqual(['home', 'activity']);
        expect(getDashboardPages(withDashboards({ dashboard: undefined }))).toEqual(['activity']);
        expect(
            getDashboardPages({ pages: { home: { component: 'dashboard', widgets: [] } } }),
        ).toEqual(['home']);
        expect(getDashboardPages(createDefinition())).toEqual([]);
    });
});

describe('the dashboard pages of the definition', () => {
    it('accepts widgets on dashboard pages, checked as those of `dashboard`', () => {
        expect(messages(withDashboards())).toEqual([]);
    });

    it('checks the widgets of each dashboard page on its own', () => {
        expect(
            messages(
                withDashboards({
                    pages: {
                        activity: {
                            component: 'dashboard',
                            widgets: [
                                { id: 'count', type: 'stat', settings: { resource: 'nope' } },
                                { id: 'count', type: 'list' },
                            ],
                        },
                    },
                }),
            ),
        ).toEqual([
            'pages.activity.widgets.0.settings.resource: No resource `nope`.',
            'pages.activity.widgets.1.id: Duplicate widget id `count`.',
        ]);
    });

    it('refuses widgets on a page that is not a dashboard', () => {
        expect(
            messages(
                withDashboards({
                    pages: { usage: { component: 'usage', widgets: ACTIVITY } },
                }),
            ),
        ).toEqual(['pages.usage.widgets: Only a `dashboard` page has widgets.']);
    });

    it('refuses widgets in both `pages.home` and `dashboard`', () => {
        const own: Widget[] = [{ id: 'visits', type: 'series' }];
        expect(
            messages(withDashboards({ pages: { home: { component: 'dashboard', widgets: own } } })),
        ).toEqual(['dashboard.widgets: `pages.home.widgets` replaces them: set only one.']);
        expect(
            messages(
                withDashboards({
                    pages: { home: { component: 'dashboard', widgets: own } },
                    dashboard: { widgets: [] },
                }),
            ),
        ).toEqual([]);
    });
});

describe('the widgets of dashboard pages in the mock backend', () => {
    function createBackend() {
        return createMockBackend({
            definition: withDashboards(),
            items: { pages: [{ title: 'A' }, { title: 'B' }] },
            widgets: {
                count: ({ items }) => ({ value: items('pages').length }),
                signups: ({ page }) => ({
                    period: 'day',
                    points: [{ date: '2026-10-05', value: page === 'activity' ? 4 : 0 }],
                }),
            },
        });
    }

    const fetchStatus = async (path: string) =>
        (await createBackend().fetch(`/panneau/api/dashboard/widgets/${path}`)).status;

    it('answers the widgets of the page of `page`, and of the home page without it', async () => {
        const backend = createBackend();
        const signups = await backend.fetch('/panneau/api/dashboard/widgets/signups?page=activity');
        expect(signups.status).toBe(200);
        expect(await signups.json()).toMatchObject({ points: [{ value: 4 }] });
        expect(await (await backend.fetch('/panneau/api/dashboard/widgets/count')).json()).toEqual({
            value: 2,
        });
        expect(await fetchStatus('count?page=home')).toBe(200);
    });

    it('answers a 404 for a widget that is not on the page', async () => {
        expect(await fetchStatus('signups')).toBe(404);
        expect(await fetchStatus('signups?page=home')).toBe(404);
        expect(await fetchStatus('count?page=activity')).toBe(404);
        expect(await fetchStatus('signups?page=usage')).toBe(404);
        expect(await fetchStatus('signups?page=nope')).toBe(404);
        // On a resource: the client reads its list
        expect(await fetchStatus('drafts?page=activity')).toBe(404);
    });
});

const SUMMARY: Widget[] = [
    { id: 'by-status', type: 'stat', settings: { resource: 'pages' } },
    { id: 'all', type: 'stat', settings: { resource: 'pages', followsList: false } },
    { id: 'health', type: 'stat' },
    { id: 'authors', type: 'stat', settings: { resource: 'authors' } },
];

/** The example definition, with a summary above the list of pages. */
function withSummary(widgets: Widget[] = SUMMARY): DefinitionInput {
    const definition = createDefinition();
    return {
        ...definition,
        resources: definition.resources.map((resource) =>
            resource.id === 'pages' ? { ...resource, summary: { widgets } } : resource,
        ),
    };
}

describe('summaries (decision 0084)', () => {
    it('reads the widgets of the summary of a resource, and the resources with one', () => {
        const definition = withSummary();
        expect(getSummaryWidgets(definition, 'pages')).toBe(SUMMARY);
        expect(getSummaryWidgets(definition, 'authors')).toEqual([]);
        expect(getSummaryWidgets(definition, 'nope')).toEqual([]);
        expect(getSummaryResources(definition)).toEqual(['pages']);
        expect(getSummaryResources(createDefinition())).toEqual([]);
    });

    it('follows the list with the widgets on its resource and those with data of their own', () => {
        expect(SUMMARY.map((widget) => followsList(widget, 'pages'))).toEqual([
            true,
            false,
            true,
            false,
        ]);
        expect(followsList({ type: 'stat', settings: { followsList: false } }, 'pages')).toBe(
            false,
        );
    });

    it('accepts a summary, checked as a dashboard, with `list: "collapsed"`', () => {
        const definition = withSummary();
        expect(messages(definition)).toEqual([]);
        const collapsed = {
            ...definition,
            resources: definition.resources.map((resource) =>
                resource.summary !== undefined
                    ? { ...resource, summary: { ...resource.summary, list: 'collapsed' as const } }
                    : resource,
            ),
        };
        expect(messages(collapsed)).toEqual([]);
        expect(
            messages({
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.summary !== undefined
                        ? { ...resource, summary: { widgets: [], list: 'hidden' } }
                        : resource,
                ),
            } as DefinitionInput),
        ).toHaveLength(1);
    });

    it('checks the widgets of a summary, and where `followsList` goes', () => {
        expect(
            messages(
                withSummary([
                    { id: 'count', type: 'stat', settings: { resource: 'nope' } },
                    { id: 'count', type: 'list', settings: { resource: 'pages' } },
                    {
                        id: 'authors',
                        type: 'stat',
                        settings: { resource: 'authors', followsList: true },
                    },
                    { id: 'by-status', type: 'breakdown', settings: { resource: 'pages' } },
                ]),
            ),
        ).toEqual([
            'resources.0.summary.widgets.0.settings.resource: No resource `nope`.',
            'resources.0.summary.widgets.1.id: Duplicate widget id `count`.',
            "resources.0.summary.widgets.2.settings.followsList: A widget on `authors` doesn't follow the list of `pages`.",
            'resources.0.summary.widgets.3.settings.group: A `breakdown` on a resource needs a `group` on a field: `status`.',
        ]);
        expect(
            messages(
                withDashboards({
                    dashboard: {
                        widgets: [{ id: 'own', type: 'stat', settings: { followsList: false } }],
                    },
                }),
            ),
        ).toEqual([
            'dashboard.widgets.0.settings.followsList: Only the widgets of the summary of a resource follow its list.',
        ]);
    });

    it('writes and reads the parameters of the widget endpoint', () => {
        expect(toWidgetDataParams().toString()).toBe('');
        expect(toWidgetDataParams({ page: 'home' }).toString()).toBe('');
        expect(toWidgetDataParams({ page: 'activity' }).toString()).toBe('page=activity');
        const summary = toWidgetDataParams({
            page: 'activity',
            resource: 'pages',
            query: { filter: { status: 'draft', published_at: { from: '2026-10-01' } }, q: 'été' },
        });
        expect(summary.toString()).toBe(
            'resource=pages&filter%5Bstatus%5D=draft&filter%5Bpublished_at%5D%5Bfrom%5D=2026-10-01&q=%C3%A9t%C3%A9',
        );
        expect(readWidgetDataQuery(summary)).toEqual({
            resource: 'pages',
            query: { filter: { status: 'draft', published_at: { from: '2026-10-01' } }, q: 'été' },
            period: null,
        });
        expect(readWidgetDataQuery(new URLSearchParams())).toEqual({ page: 'home', period: null });
        expect(readWidgetDataQuery(new URLSearchParams('page=activity&sort=title'))).toEqual({
            page: 'activity',
            period: null,
        });
        expect(
            readWidgetDataQuery(new URLSearchParams('resource=pages&page=2')).errors,
        ).toHaveProperty('page');
        expect(readWidgetDataQuery(new URLSearchParams('resource=')).errors).toHaveProperty(
            'resource',
        );
    });
});

describe('the widgets of summaries in the mock backend', () => {
    function createBackend(definition = withSummary()) {
        return createMockBackend({
            definition,
            items: { pages: [{ title: 'A' }, { title: 'B' }] },
            widgets: {
                health: ({ resource, page, query }) => ({
                    value: query.q !== undefined ? 0 : 1,
                    help: `${String(resource)} ${String(page)} ${JSON.stringify(query.filter ?? {})}`,
                }),
                count: ({ items }) => ({ value: items('pages').length }),
            },
        });
    }

    const fetchWidget = (path: string, backend = createBackend()) =>
        backend.fetch(`/panneau/api/dashboard/widgets/${path}`);

    it('answers the widgets of the summary of `resource`, with the query of the list', async () => {
        const reply = await fetchWidget('health?resource=pages&filter%5Bstatus%5D=draft');
        expect(reply.status).toBe(200);
        expect(await reply.json()).toEqual({ value: 1, help: 'pages null {"status":"draft"}' });
        expect(await (await fetchWidget('health?resource=pages&q=river')).json()).toMatchObject({
            value: 0,
        });
    });

    it('answers a 404 for a widget that is not in the summary, and a 422 for a page too', async () => {
        expect((await fetchWidget('health')).status).toBe(404);
        expect((await fetchWidget('health?resource=authors')).status).toBe(404);
        expect((await fetchWidget('nope?resource=pages')).status).toBe(404);
        // On a resource: the client reads its list
        expect((await fetchWidget('by-status?resource=pages')).status).toBe(404);
        expect((await fetchWidget('health?resource=pages&page=home')).status).toBe(422);
    });

    it('answers a 403 for the summary of a resource the user can’t list', async () => {
        const definition = withSummary();
        const pages = definition.resources[0];
        if (pages !== undefined) {
            pages.abilities = { viewAny: false };
        }
        expect((await fetchWidget('health?resource=pages', createBackend(definition))).status).toBe(
            403,
        );
    });
});
