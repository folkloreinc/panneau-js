import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { getDashboardPages, getDashboardWidgets } from './dashboards';
import { createMockBackend } from './mock';
import type { DefinitionInput, Widget } from './schemas';
import { validateDefinition } from './validate';

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
