import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import {
    getDashboardPeriod,
    getSummaryPeriodFilter,
    readWidgetDataQuery,
    toWidgetDataParams,
} from './dashboards';
import { createMockBackend } from './mock';
import {
    findPeriodOption,
    getDefaultPeriod,
    getPeriodRange,
    isDay,
    localDay,
    readPeriodOption,
} from './periods';
import type { DefinitionInput, Widget } from './schemas';
import { validateDefinition } from './validate';
import { followsPeriod } from './widgets';

const messages = (definition: DefinitionInput) => {
    const result = validateDefinition(definition);
    return result.success ? [] : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
};

describe('getPeriodRange', () => {
    it('counts 7, 30 and 90 days ending today, today included', () => {
        expect(getPeriodRange('7d', '2026-11-17')).toEqual({
            from: '2026-11-11',
            to: '2026-11-17',
        });
        expect(getPeriodRange('30d', '2026-11-17')).toEqual({
            from: '2026-10-19',
            to: '2026-11-17',
        });
        expect(getPeriodRange('90d', '2026-03-01')).toEqual({
            from: '2025-12-02',
            to: '2026-03-01',
        });
    });

    it('takes the current month, and the 12 months ending with it, up to today', () => {
        expect(getPeriodRange('month', '2026-11-17')).toEqual({
            from: '2026-11-01',
            to: '2026-11-17',
        });
        expect(getPeriodRange('year', '2026-11-17')).toEqual({
            from: '2025-12-01',
            to: '2026-11-17',
        });
        expect(getPeriodRange('year', '2026-01-31')).toEqual({
            from: '2025-02-01',
            to: '2026-01-31',
        });
    });

    it('reads today in the local time zone', () => {
        const today = new Date(2026, 10, 17, 23, 30);
        expect(localDay(today)).toBe('2026-11-17');
        expect(getPeriodRange('7d', today).to).toBe('2026-11-17');
    });

    it('checks days', () => {
        expect(isDay('2026-02-28')).toBe(true);
        expect(isDay('2026-02-30')).toBe(false);
        expect(isDay('2026-2-28')).toBe(false);
        expect(isDay(null)).toBe(false);
    });
});

describe('the option of a period', () => {
    const period = { options: ['7d', '30d', 'month'], default: '30d' };

    it('reads the option of the URL when the overview offers it, else its default', () => {
        expect(readPeriodOption('7d', period)).toBe('7d');
        expect(readPeriodOption('90d', period)).toBe('30d');
        expect(readPeriodOption(null, period)).toBe('30d');
        expect(getDefaultPeriod({ options: ['month', 'year'] })).toBe('month');
    });

    it('finds the option of a range, if one is', () => {
        expect(
            findPeriodOption({ from: '2026-11-11', to: '2026-11-17' }, period, '2026-11-17'),
        ).toBe('7d');
        expect(
            findPeriodOption({ from: '2026-11-12', to: '2026-11-17' }, period, '2026-11-17'),
        ).toBeNull();
        expect(findPeriodOption('2026-11-17', period, '2026-11-17')).toBeNull();
    });
});

describe('the period of a widget', () => {
    it('is followed by widgets with data of their own and widgets that name a filter', () => {
        const own: Widget = { id: 'own', type: 'stat' };
        const named: Widget = {
            id: 'named',
            type: 'stat',
            settings: { resource: 'pages', period: 'published_at' },
        };
        const onResource: Widget = { id: 'count', type: 'stat', settings: { resource: 'pages' } };
        const opted: Widget = { id: 'opted', type: 'stat', settings: { period: false } };
        expect([own, named, onResource, opted].map((widget) => followsPeriod(widget))).toEqual([
            true,
            true,
            false,
            false,
        ]);
        // In a summary, the period is the list's filter: widgets that follow the list follow it
        expect(followsPeriod(onResource, 'pages')).toBe(true);
        expect(followsPeriod(onResource, 'authors')).toBe(false);
    });

    it('goes to the widget endpoint as period[option], period[from] and period[to]', () => {
        const period = { option: '30d' as const, from: '2026-10-19', to: '2026-11-17' };
        const params = toWidgetDataParams({ page: 'activity', period });
        expect(params.toString()).toBe(
            'page=activity&period%5Boption%5D=30d&period%5Bfrom%5D=2026-10-19&period%5Bto%5D=2026-11-17',
        );
        expect(readWidgetDataQuery(params)).toEqual({ page: 'activity', period });
        expect(readWidgetDataQuery(toWidgetDataParams({ resource: 'pages', period }))).toEqual({
            resource: 'pages',
            query: {},
            period,
        });
        const wrong = (search: string) =>
            readWidgetDataQuery(new URLSearchParams(search)).errors?.period;
        expect(
            wrong('period[option]=decade&period[from]=2026-01-01&period[to]=2026-12-31'),
        ).toEqual(['The period must be one of 7d, 30d, 90d, month and year.']);
        expect(wrong('period[option]=7d&period[from]=2026-01-08')).toHaveLength(1);
        expect(
            wrong('period[option]=7d&period[from]=2026-01-08&period[to]=2026-01-01'),
        ).toHaveLength(1);
    });
});

/** The example definition with periods: a dashboard page, the home page, and a summary. */
function withPeriods(overrides: Partial<DefinitionInput> = {}): DefinitionInput {
    const definition = createDefinition();
    return {
        ...definition,
        resources: definition.resources.map((resource) =>
            resource.id === 'pages'
                ? {
                      ...resource,
                      summary: {
                          widgets: [
                              { id: 'count', type: 'stat', settings: { resource: 'pages' } },
                              { id: 'own', type: 'stat', settings: { period: false } },
                          ],
                          period: { options: ['7d', '30d'] },
                      },
                  }
                : resource,
        ),
        pages: {
            home: { component: 'dashboard' },
            activity: {
                component: 'dashboard',
                period: { options: ['30d', 'year'], default: 'year' },
                widgets: [
                    {
                        id: 'published',
                        type: 'stat',
                        settings: { resource: 'pages', period: 'published_at' },
                    },
                    { id: 'signups', type: 'stat' },
                ],
            },
        },
        dashboard: { widgets: [], period: { options: ['7d'] } },
        ...overrides,
    };
}

describe('the periods of the definition', () => {
    it('reads the period of a dashboard page, of the home page, and the filter of a summary', () => {
        const definition = withPeriods();
        expect(getDashboardPeriod(definition, 'activity')?.default).toBe('year');
        expect(getDashboardPeriod(definition)).toEqual({ options: ['7d'] });
        expect(getDashboardPeriod(definition, 'nope')).toBeUndefined();
        expect(getSummaryPeriodFilter(definition.resources[0] ?? {})).toBe('published_at');
        expect(getSummaryPeriodFilter(definition.resources[1] ?? {})).toBeNull();
    });

    it('accepts periods on dashboards and summaries', () => {
        expect(messages(withPeriods())).toEqual([]);
    });

    it('checks the options, where a period goes, and the filters it names', () => {
        const definition = withPeriods({
            pages: {
                home: { component: 'dashboard', period: { options: ['7d'] } },
                usage: { component: 'usage', period: { options: ['7d'] } },
                activity: {
                    component: 'dashboard',
                    period: { options: ['30d', '30d'], default: '7d' },
                    widgets: [
                        { id: 'a', type: 'stat', settings: { resource: 'pages', period: 'nope' } },
                        { id: 'b', type: 'stat', settings: { period: 'published_at' } },
                    ],
                },
                plain: {
                    component: 'dashboard',
                    widgets: [{ id: 'c', type: 'stat', settings: { period: false } }],
                },
            },
        });
        const pages = definition.resources[0];
        if (pages?.summary !== undefined) {
            pages.summary.period = { options: ['7d'], filter: 'status' };
        }
        expect(messages(definition)).toEqual([
            'resources.0.summary.period.filter: The list of `pages` has no `date-range` filter `status`.',
            'pages.usage.period: Only a `dashboard` page has a period.',
            'pages.activity.period.options: Each period is offered once.',
            "pages.activity.period.default: `7d` isn't one of the options.",
            'pages.activity.widgets.0.settings.period: The list of `pages` has no `date-range` filter `nope`.',
            'pages.activity.widgets.1.settings.period: `period` names a `date-range` filter of the list of its `resource`: without one, it can only be `false`.',
            'pages.plain.widgets.0.settings.period: Its dashboard has no `period`.',
            'dashboard.period: `pages.home.period` replaces it: set only one.',
        ]);
    });

    it('needs a date-range filter in the list of a summary with a period', () => {
        const definition = withPeriods();
        const authors = definition.resources[1];
        if (authors !== undefined) {
            authors.summary = { widgets: [], period: { options: ['7d'] } };
        }
        expect(messages(definition)).toEqual([
            'resources.1.summary.period: The period of a summary is a `date-range` filter of the list of `authors`: it has none.',
        ]);
    });
});

describe('the period in the mock backend', () => {
    it('gives widget functions the period, and refuses a wrong one', async () => {
        const backend = createMockBackend({
            definition: withPeriods(),
            widgets: { signups: ({ period }) => ({ value: period?.option === 'year' ? 12 : 0 }) },
        });
        const reply = await backend.fetch(
            '/panneau/api/dashboard/widgets/signups?page=activity&period%5Boption%5D=year&period%5Bfrom%5D=2025-12-01&period%5Bto%5D=2026-11-17',
        );
        expect(await reply.json()).toEqual({ value: 12 });
        const wrong = await backend.fetch(
            '/panneau/api/dashboard/widgets/signups?page=activity&period%5Boption%5D=year',
        );
        expect(wrong.status).toBe(422);
    });
});
