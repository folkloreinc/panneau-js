import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import {
    aggregateItems,
    listPeriods,
    nextPeriod,
    parseAggregateGroup,
    parseAggregateMeasure,
    readAggregateQuery,
    startOfPeriod,
    toAggregateParams,
} from './aggregates';
import { createMockBackend } from './mock';
import {
    type BreakdownWidgetData,
    type DefinitionInput,
    type ResourceInput,
    type SeriesWidgetData,
    type Widget,
    widgetDataSchemas,
} from './schemas';
import { validateDefinition } from './validate';

const fields = [
    {
        name: 'status',
        type: 'select',
        options: [
            { value: 'running', label: 'Running', tone: 'info' },
            { value: 'failed', label: 'Failed', tone: 'danger' },
            { value: 'done', label: 'Done', tone: 'success' },
        ],
    },
    { name: 'tags', type: 'tags' },
    { name: 'owner', type: 'relation' },
    { name: 'cost', type: 'money' },
    { name: 'created_at', type: 'datetime' },
];

const runs = [
    {
        status: 'done',
        tags: ['a', 'b'],
        owner: { id: '1', label: 'Ada' },
        cost: { amount: 1250, currency: 'CAD' },
        created_at: '2026-10-05T10:00:00-04:00',
    },
    {
        status: 'failed',
        tags: ['a'],
        owner: { id: '2', label: 'Grace' },
        cost: { amount: 300, currency: 'CAD' },
        created_at: '2026-10-05T23:30:00-04:00',
    },
    { status: 'done', tags: [], owner: null, cost: null, created_at: '2026-10-08T09:00:00Z' },
    { status: 'running', tags: ['b'], owner: { id: '1', label: 'Ada' }, created_at: null },
];

describe('the measure and the group', () => {
    it('reads a count, a sum, a period of a date and a field', () => {
        expect(parseAggregateMeasure('count')).toEqual({ type: 'count' });
        expect(parseAggregateMeasure('sum:cost')).toEqual({ type: 'sum', field: 'cost' });
        expect(parseAggregateMeasure('avg:cost')).toBeNull();
        expect(parseAggregateMeasure('sum:')).toBeNull();
        expect(parseAggregateGroup('week:created_at')).toEqual({
            type: 'period',
            period: 'week',
            field: 'created_at',
        });
        expect(parseAggregateGroup('status')).toEqual({ type: 'field', field: 'status' });
        expect(parseAggregateGroup('year:created_at')).toBeNull();
        expect(parseAggregateGroup('day:')).toBeNull();
        expect(parseAggregateGroup('')).toBeNull();
    });

    it('writes the filters and the search of the list, then the measure and the group', () => {
        expect(
            toAggregateParams({
                filter: { status: 'done', created_at: { from: '2026-10-01' } },
                q: 'nightly',
                group: 'day:created_at',
            }).toString(),
        ).toBe(
            'filter%5Bstatus%5D=done&filter%5Bcreated_at%5D%5Bfrom%5D=2026-10-01&q=nightly&measure=count&group=day%3Acreated_at',
        );
        expect(toAggregateParams({ measure: 'sum:cost', group: null }).toString()).toBe(
            'measure=sum%3Acost',
        );
    });

    it('accepts only what the list declares, with errors keyed by parameter', () => {
        const aggregates = { sum: ['cost'], groupBy: ['status'], dates: ['created_at'] };
        const read = (query: string) => readAggregateQuery(new URLSearchParams(query), aggregates);
        expect(read('')).toEqual({ query: { measure: { type: 'count' }, group: null } });
        expect(read('measure=sum:cost&group=month:created_at').query).toEqual({
            measure: { type: 'sum', field: 'cost' },
            group: { type: 'period', period: 'month', field: 'created_at' },
        });
        expect(read('measure=sum:tokens&group=owner').errors).toEqual({
            measure: ["The field `tokens` can't be summed."],
            group: ["The items can't be grouped by the field `owner`."],
        });
        expect(read('measure=max&group=day:status').errors).toEqual({
            measure: ['The measure must be `count` or `sum:{field}`.'],
            group: ["The field `status` isn't a date that can be grouped."],
        });
        expect(read('group=year:created_at').errors).toEqual({
            group: ['The group must be `{day|week|month}:{date field}` or a field.'],
        });
    });
});

describe('the periods', () => {
    it('start on the day, the Monday of the week, or the first of the month', () => {
        expect(startOfPeriod('2026-10-08', 'day')).toBe('2026-10-08');
        expect(startOfPeriod('2026-10-08T23:00:00-04:00', 'week')).toBe('2026-10-05');
        expect(startOfPeriod('2026-10-11', 'week')).toBe('2026-10-05');
        expect(startOfPeriod('2026-10-05', 'week')).toBe('2026-10-05');
        expect(startOfPeriod('2026-10-31', 'month')).toBe('2026-10-01');
        expect(nextPeriod('2026-12-28', 'week')).toBe('2027-01-04');
        expect(nextPeriod('2026-01-01', 'month')).toBe('2026-02-01');
    });

    it('lists every period of a range, at most the latest ones', () => {
        expect(listPeriods('2026-10-30', '2026-11-02', 'day')).toEqual([
            '2026-10-30',
            '2026-10-31',
            '2026-11-01',
            '2026-11-02',
        ]);
        expect(listPeriods('2026-01-15', '2026-03-02', 'month')).toEqual([
            '2026-01-01',
            '2026-02-01',
            '2026-03-01',
        ]);
        expect(listPeriods('2026-10-05', '2026-10-01', 'day')).toEqual([]);
        expect(listPeriods('2026-01-01', '2026-01-10', 'day', 3)).toEqual([
            '2026-01-08',
            '2026-01-09',
            '2026-01-10',
        ]);
        expect(listPeriods('2020-01-01', '2026-12-31', 'day')).toHaveLength(366);
    });
});

describe('aggregateItems', () => {
    const count = { type: 'count' } as const;
    const cost = { type: 'sum', field: 'cost' } as const;

    it('counts or sums the items, amounts of money in minor units', () => {
        expect(aggregateItems(runs, { measure: count, group: null }, { fields })).toEqual({
            value: 4,
        });
        expect(aggregateItems(runs, { measure: cost, group: null }, { fields })).toEqual({
            value: 1550,
        });
    });

    it('draws a point per period, at 0 without items, over the days of the items', () => {
        const days = aggregateItems(
            runs,
            { measure: count, group: { type: 'period', period: 'day', field: 'created_at' } },
            { fields },
        );
        // The day as the backend writes it, without converting the time zone
        expect(days).toEqual({
            period: 'day',
            points: [
                { date: '2026-10-05', value: 2 },
                { date: '2026-10-06', value: 0 },
                { date: '2026-10-07', value: 0 },
                { date: '2026-10-08', value: 1 },
            ],
            total: 3,
        });
    });

    it('draws the range of the filter on the date, its open end from the items', () => {
        const weeks = (range: { from?: string; to?: string }) =>
            aggregateItems(
                runs,
                {
                    measure: cost,
                    group: { type: 'period', period: 'week', field: 'created_at' },
                },
                { fields, range },
            ) as SeriesWidgetData;
        expect(weeks({ from: '2026-09-21', to: '2026-10-19' })).toEqual({
            period: 'week',
            points: [
                { date: '2026-09-21', value: 0 },
                { date: '2026-09-28', value: 0 },
                { date: '2026-10-05', value: 1550 },
                { date: '2026-10-12', value: 0 },
                { date: '2026-10-19', value: 0 },
            ],
            total: 1550,
        });
        expect(weeks({ from: '2026-09-28' }).points.map((point) => point.date)).toEqual([
            '2026-09-28',
            '2026-10-05',
        ]);
        expect(
            aggregateItems(
                [],
                { measure: count, group: { type: 'period', period: 'day', field: 'created_at' } },
                { fields },
            ),
        ).toEqual({ period: 'day', points: [], total: 0 });
    });

    it('breaks down by the options of a select, the largest first', () => {
        expect(
            aggregateItems(
                runs,
                { measure: count, group: { type: 'field', field: 'status' } },
                { fields },
            ),
        ).toEqual({
            items: [
                { label: 'Done', value: 2, key: 'done', tone: 'success' },
                { label: 'Running', value: 1, key: 'running', tone: 'info' },
                { label: 'Failed', value: 1, key: 'failed', tone: 'danger' },
            ],
            total: 4,
        });
    });

    it('counts several values in each of their parts, and an item without one apart', () => {
        expect(
            aggregateItems(
                runs,
                { measure: count, group: { type: 'field', field: 'tags' } },
                { fields, emptyLabel: 'No tag' },
            ),
        ).toEqual({
            items: [
                { label: 'a', value: 2, key: 'a' },
                { label: 'b', value: 2, key: 'b' },
                { label: 'No tag', value: 1, key: null },
            ],
            total: 4,
        });
        expect(
            aggregateItems(
                runs,
                { measure: cost, group: { type: 'field', field: 'owner' } },
                { fields },
            ),
        ).toEqual({
            items: [
                { label: 'Ada', value: 1250, key: '1' },
                { label: 'Grace', value: 300, key: '2' },
                { label: 'None', value: 0, key: null },
            ],
            total: 1550,
        });
    });

    it('keeps the largest parts, and the rest in other', () => {
        const items = Array.from({ length: 13 }, (_, index) => ({ code: `c${index % 12}` }));
        const breakdown = aggregateItems(
            items,
            { measure: count, group: { type: 'field', field: 'code' } },
            { fields: [] },
        ) as BreakdownWidgetData;
        expect(breakdown).toMatchObject({ total: 13, other: 2 });
        expect(breakdown.items).toHaveLength(10);
        expect(breakdown.items[0]).toEqual({
            label: 'c0',
            value: 2,
            key: 'c0',
        });
    });
});

describe('the aggregates of a list in the definition', () => {
    const withRuns = (runsResource: Partial<ResourceInput>, widgets: Widget[] = []) => {
        const definition: DefinitionInput = { ...createDefinition(), dashboard: { widgets } };
        definition.resources.push({
            id: 'runs',
            label: { singular: 'run', plural: 'runs' },
            fields: [
                {
                    name: 'status',
                    type: 'select',
                    options: [{ value: 'done', label: 'Done' }],
                },
                { name: 'tokens', type: 'number' },
                { name: 'cost', type: 'money', settings: { currency: 'CAD' } },
                { name: 'price', type: 'money' },
                { name: 'created_at', type: 'datetime' },
                { name: 'title', type: 'text' },
                { name: 'secret', type: 'number', abilities: { view: false } },
                { name: 'body', type: 'richtext' },
            ],
            ...runsResource,
        });
        return definition;
    };
    const messages = (definition: DefinitionInput) => {
        const result = validateDefinition(definition);
        return result.success
            ? []
            : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
    };

    it('accepts fields that sum, dates and values to group by', () => {
        expect(
            messages(
                withRuns({
                    list: {
                        aggregates: {
                            sum: ['tokens', 'cost'],
                            groupBy: ['status', 'title'],
                            dates: ['created_at'],
                        },
                    },
                }),
            ),
        ).toEqual([]);
    });

    it('refuses unknown fields, and fields that do not sum, date or group', () => {
        expect(
            messages(
                withRuns({
                    list: {
                        aggregates: {
                            sum: ['nope', 'title', 'price', 'secret'],
                            groupBy: ['body'],
                            dates: ['tokens'],
                        },
                    },
                }),
            ),
        ).toEqual([
            'resources.3.list.aggregates.sum.0: No field named `nope`.',
            "resources.3.list.aggregates.sum.1: `title` can't be summed: only `number`, `range`, `duration` and `money` fields can.",
            "resources.3.list.aggregates.sum.2: `price` can't be summed: amounts add up only in one `currency`.",
            "resources.3.list.aggregates.sum.3: The user can't view `secret`: it can't be aggregated.",
            'resources.3.list.aggregates.dates.0: `tokens` must be a `date` or a `datetime` to be grouped by period.',
            "resources.3.list.aggregates.groupBy.0: The items can't be grouped by a `richtext` field.",
        ]);
    });

    it('accepts widgets on aggregates the list declares', () => {
        expect(
            messages(
                withRuns(
                    {
                        list: {
                            pagination: 'cursor',
                            aggregates: {
                                sum: ['cost'],
                                groupBy: ['status'],
                                dates: ['created_at'],
                            },
                        },
                    },
                    [
                        {
                            id: 'cost',
                            type: 'stat',
                            settings: { resource: 'runs', measure: 'sum:cost', target: 50000 },
                        },
                        {
                            id: 'per-day',
                            type: 'series',
                            settings: { resource: 'runs', group: 'day:created_at' },
                        },
                        {
                            id: 'by-status',
                            type: 'breakdown',
                            settings: { resource: 'runs', measure: 'sum:cost', group: 'status' },
                        },
                    ],
                ),
            ),
        ).toEqual([]);
    });

    it('refuses measures and groups the list does not declare, or that the type does not take', () => {
        expect(
            messages(
                withRuns({ list: { aggregates: { groupBy: ['status'], dates: ['created_at'] } } }, [
                    { id: 'a', type: 'stat', settings: { resource: 'runs', measure: 'sum:cost' } },
                    {
                        id: 'b',
                        type: 'series',
                        settings: { resource: 'runs', measure: 'avg', group: 'status' },
                    },
                    {
                        id: 'c',
                        type: 'breakdown',
                        settings: { resource: 'runs', group: 'day:created_at' },
                    },
                    { id: 'd', type: 'breakdown', settings: { resource: 'runs', group: 'title' } },
                    {
                        id: 'e',
                        type: 'list',
                        settings: { resource: 'runs', measure: 'count', target: 3 },
                    },
                    { id: 'f', type: 'stat', settings: { resource: 'runs', group: 'status' } },
                    { id: 'g', type: 'breakdown', settings: { group: 'status' } },
                ]),
            ),
        ).toEqual([
            "dashboard.widgets.0.settings.measure: The list of `runs` can't sum `cost`: it isn't in the `sum` of its aggregates.",
            'dashboard.widgets.1.settings.measure: The measure must be `count` or `sum:{field}`.',
            'dashboard.widgets.1.settings.group: A `series` on a resource needs a `group` on the period of a date: `day:created_at`.',
            'dashboard.widgets.2.settings.group: A `breakdown` on a resource needs a `group` on a field: `status`.',
            "dashboard.widgets.3.settings.group: The list of `runs` can't group by `title`: it isn't in the `groupBy` of its aggregates.",
            'dashboard.widgets.4.settings.target: Only a `stat` has a `target`.',
            'dashboard.widgets.4.settings.measure: A `list` shows items: it has no `measure`.',
            "dashboard.widgets.5.settings.group: A `stat` isn't grouped: only a `series` and a `breakdown` are.",
            'dashboard.widgets.6.settings.group: `group` goes with a `resource`.',
        ]);
    });
});

describe('the aggregate endpoint of the mock backend', () => {
    function createBackend() {
        const definition = createDefinition();
        const pages = definition.resources[0];
        if (pages?.list !== undefined) {
            pages.list.aggregates = { groupBy: ['status'], dates: ['published_at'] };
        }
        definition.resources.push({
            id: 'secrets',
            label: { singular: 'secret', plural: 'secrets' },
            fields: [{ name: 'name', type: 'text' }],
            list: { aggregates: {} },
            abilities: { viewAny: false },
        });
        return createMockBackend({
            definition,
            items: {
                pages: [
                    { title: { fr: 'A' }, status: 'published', published_at: '2026-10-01T12:00Z' },
                    { title: { fr: 'B' }, status: 'published', published_at: '2026-10-03T08:00Z' },
                    { title: { fr: 'C' }, status: 'draft', published_at: null },
                ],
            },
            context: {
                // Only the published pages are in the context
                scope: (resource, item) => resource !== 'pages' || item.status === 'published',
            },
        });
    }
    const get = async (path: string) => {
        const response = await createBackend().fetch(`/panneau/api/resources/${path}`);
        return { status: response.status, body: (await response.json()) as unknown };
    };

    it('answers a stat, a series and a breakdown of the items in scope', async () => {
        expect(await get('pages/aggregate')).toEqual({ status: 200, body: { value: 2 } });
        const series = await get(
            'pages/aggregate?group=day:published_at&filter[published_at][to]=2026-10-04',
        );
        expect(series.body).toEqual({
            period: 'day',
            points: [
                { date: '2026-10-01', value: 1 },
                { date: '2026-10-02', value: 0 },
                { date: '2026-10-03', value: 1 },
                { date: '2026-10-04', value: 0 },
            ],
            total: 2,
        });
        const breakdown = await get('pages/aggregate?group=status&q=A');
        expect(breakdown.body).toEqual({
            items: [{ label: 'Publiée', value: 1, key: 'published' }],
            total: 1,
        });
        expect(widgetDataSchemas.breakdown.safeParse(breakdown.body).success).toBe(true);
    });

    it('refuses what the list does not declare, and resources without aggregates', async () => {
        const refused = await get('pages/aggregate?measure=sum:title&group=author');
        expect(refused).toMatchObject({
            status: 422,
            body: {
                type: 'urn:panneau:problem:validation',
                errors: {
                    measure: ["The field `title` can't be summed."],
                    group: ["The items can't be grouped by the field `author`."],
                },
            },
        });
        expect((await get('authors/aggregate')).status).toBe(404);
        expect((await get('secrets/aggregate')).status).toBe(403);
    });
});
