import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { createMockBackend } from './mock';
import { getPreviousRange } from './periods';
import type { DefinitionInput, ResourceInput, Widget } from './schemas';
import { WidgetNumberFormat, widgetDataSchemas } from './schemas';
import { validateDefinition } from './validate';
import {
    checkWidgetData,
    followsList,
    followsPeriod,
    getChangeTone,
    getWidgetAggregates,
    getWidgetChange,
    getWidgetSources,
    isCombinedWidget,
    isWidgetDataEmpty,
    readWidgetFormat,
    readsResources,
} from './widgets';

/** A resource of logs with aggregates, a status, a cost, and a date-range filter on its date. */
function log(id: string, extra: Partial<ResourceInput> = {}): ResourceInput {
    return {
        id,
        label: { singular: id, plural: id },
        fields: [
            {
                name: 'status',
                type: 'select',
                options: [
                    { value: 'sent', label: 'Sent', tone: 'success' },
                    { value: 'failed', label: 'Failed', tone: 'danger' },
                ],
            },
            { name: 'cost', type: 'money', settings: { currency: 'USD' } },
            { name: 'sent_at', type: 'datetime' },
        ],
        list: {
            filters: [
                { id: 'status', type: 'select' },
                { id: 'sent_at', type: 'date-range' },
            ],
            aggregates: { sum: ['cost'], groupBy: ['status'], dates: ['sent_at'] },
        },
        abilities: { viewAny: true },
        ...extra,
    };
}

function withWidgets(widgets: Widget[], period = true): DefinitionInput {
    const definition = createDefinition();
    definition.resources.push(log('emails'), log('texts'));
    return {
        ...definition,
        pages: {
            activity: {
                component: 'dashboard',
                label: 'Activity',
                widgets,
                ...(period && { period: { options: ['7d', '30d'] as const } }),
            },
        },
    } as DefinitionInput;
}

const messages = (definition: DefinitionInput) => {
    const result = validateDefinition(definition);
    return result.success ? [] : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
};

const METRIC: Widget = {
    id: 'emails',
    type: 'metric',
    label: 'Emails',
    settings: {
        resource: 'emails',
        query: { 'filter[status]': 'sent' },
        measure: 'sum:cost',
        points: 'day:sent_at',
        by: 'status',
        period: 'sent_at',
        goodWhen: 'down',
        target: 1000,
    },
};

const SPLIT: Widget = {
    id: 'per-status',
    type: 'series',
    settings: { resource: 'emails', group: 'day:sent_at', split: 'status', stacked: true },
};

const SOURCES: Widget = {
    id: 'messages',
    type: 'series',
    settings: {
        group: 'day:sent_at',
        period: 'sent_at',
        sources: [
            { resource: 'emails', label: 'Emails', help: 'To members' },
            {
                resource: 'texts',
                label: 'Text messages',
                tone: 'info',
                period: false,
                alert: { query: { 'filter[status]': 'failed' }, label: 'failed' },
            },
        ],
    },
};

const ROWS: Widget = {
    id: 'activity',
    type: 'table',
    settings: {
        points: 'week:sent_at',
        period: 'sent_at',
        rows: [
            { resource: 'emails', label: 'Emails', measure: 'sum:cost' },
            {
                resource: 'texts',
                label: 'Texts',
                query: { 'filter[status]': 'sent' },
                alert: { query: { 'filter[status]': 'failed' }, label: 'failed', tone: 'warning' },
            },
        ],
    },
};

describe('combined widgets (decision 0089)', () => {
    describe('their sources and their reads', () => {
        it('read the sources of a series and the rows of a table, with the defaults of the widget', () => {
            const [emails, texts] = getWidgetSources(SOURCES);
            expect(emails).toMatchObject({
                resource: 'emails',
                label: 'Emails',
                measure: 'count',
                group: 'day:sent_at',
                period: 'sent_at',
                help: 'To members',
                tone: null,
                alert: null,
            });
            expect(texts).toMatchObject({ period: false, tone: 'info' });
            expect(texts?.alert?.params.toString()).toBe('filter%5Bstatus%5D=failed');
            expect(texts?.alert?.tone).toBe('danger');
            const [, row] = getWidgetSources(ROWS);
            // The alert's filter replaces the same filter of its row
            expect(row?.alert?.query).toEqual({ filter: { status: 'failed' } });
            expect(row?.group).toBe('week:sent_at');
            expect(getWidgetSources(METRIC)).toEqual([]);
        });

        it('list the aggregates each one reads', () => {
            expect(
                getWidgetAggregates(METRIC).map(({ role, group, measure }) => [
                    role,
                    group,
                    measure,
                ]),
            ).toEqual([
                ['value', null, 'sum:cost'],
                ['points', 'day:sent_at', 'sum:cost'],
                ['parts', 'status', 'sum:cost'],
            ]);
            expect(getWidgetAggregates(SPLIT).map(({ role, group }) => [role, group])).toEqual([
                ['points', 'day:sent_at'],
                ['parts', 'status'],
            ]);
            expect(
                getWidgetAggregates(SOURCES).map(({ role, source, group, period }) => [
                    role,
                    source,
                    group,
                    period,
                ]),
            ).toEqual([
                ['points', 0, 'day:sent_at', 'sent_at'],
                ['points', 1, 'day:sent_at', false],
                ['alert', 1, null, false],
            ]);
            expect(getWidgetAggregates(ROWS).map(({ role, source }) => [role, source])).toEqual([
                ['value', 0],
                ['points', 0],
                ['value', 1],
                ['points', 1],
                ['alert', 1],
            ]);
        });

        it('read resources, follow the list and the period through their sources', () => {
            [METRIC, SPLIT, SOURCES, ROWS].forEach((widget) => {
                expect(isCombinedWidget(widget)).toBe(true);
                expect(readsResources(widget)).toBe(true);
            });
            expect(isCombinedWidget({ type: 'series', settings: { resource: 'emails' } })).toBe(
                false,
            );
            expect(readsResources({ type: 'metric' })).toBe(false);
            expect(readsResources({ type: 'table' })).toBe(false);
            expect(followsList(SOURCES, 'texts')).toBe(true);
            expect(followsList(SOURCES, 'pages')).toBe(false);
            expect(followsPeriod(SOURCES)).toBe(true);
            expect(followsPeriod(SPLIT)).toBe(false);
            expect(followsPeriod({ type: 'metric' })).toBe(true);
        });
    });

    describe('in the definition', () => {
        it('accept combined widgets on resources that declare what they read', () => {
            expect(messages(withWidgets([METRIC, SPLIT, SOURCES, ROWS]))).toEqual([]);
            expect(
                messages(
                    withWidgets([
                        { id: 'm', type: 'metric', settings: { format: { style: 'percent' } } },
                        { id: 't', type: 'table', settings: { hideEmpty: true } },
                    ]),
                ),
            ).toEqual([]);
        });

        it('refuse settings of another type, and what the lists do not declare', () => {
            expect(
                messages(
                    withWidgets([
                        { id: 'a', type: 'stat', settings: { goodWhen: 'up', stacked: true } },
                        {
                            id: 'b',
                            type: 'metric',
                            settings: { resource: 'emails', points: 'status', by: 'cost' },
                        },
                        {
                            id: 'c',
                            type: 'series',
                            settings: { resource: 'emails', group: 'day:sent_at', split: 'cost' },
                        },
                        {
                            id: 'd',
                            type: 'series',
                            settings: {
                                resource: 'emails',
                                sources: [{ resource: 'emails', label: 'Emails' }],
                            },
                        },
                        { id: 'e', type: 'table', settings: { points: 'day:sent_at' } },
                    ]),
                ),
            ).toEqual([
                'pages.activity.widgets.0.settings.goodWhen: Only a `metric` or a `table` has `goodWhen`.',
                'pages.activity.widgets.0.settings.stacked: Only a `series` has `stacked`.',
                'pages.activity.widgets.1.settings.points: The trend of a `metric` needs a period of a date: `day:created_at`.',
                "pages.activity.widgets.1.settings.by: The list of `emails` can't group by `cost`: it isn't in the `groupBy` of its aggregates.",
                "pages.activity.widgets.2.settings.split: The list of `emails` can't group by `cost`: it isn't in the `groupBy` of its aggregates.",
                'pages.activity.widgets.2.settings.split: The list of `emails` has no filter `cost` to read each of its values.',
                'pages.activity.widgets.3.settings.sources: `sources` name their resources: the widget has no `resource`.',
                'pages.activity.widgets.4.settings.points: `points` goes with a `resource`.',
            ]);
        });

        it('check each source: its resource, its aggregates, its period, its query and its alert', () => {
            const definition = withWidgets([
                {
                    id: 'a',
                    type: 'series',
                    settings: {
                        sources: [
                            { resource: 'nope', label: 'Nope' },
                            { resource: 'pages', label: 'Pages', group: 'day:created_at' },
                            {
                                resource: 'emails',
                                label: 'Emails',
                                measure: 'sum:status',
                                period: 'status',
                                alert: { query: { 'filter[color]': 'red' }, label: 'red' },
                            },
                        ],
                    },
                },
                {
                    id: 'b',
                    type: 'table',
                    settings: {
                        rows: [
                            { resource: 'emails', label: 'Days', points: 'day:sent_at' },
                            { resource: 'texts', label: 'Weeks', points: 'week:sent_at' },
                        ],
                    },
                },
            ]);
            expect(messages(definition)).toEqual([
                'pages.activity.widgets.0.settings.sources.0.resource: No resource `nope`.',
                'pages.activity.widgets.0.settings.sources.1.resource: The list of `pages` declares no `aggregates`.',
                "pages.activity.widgets.0.settings.sources.2.measure: The list of `emails` can't sum `status`: it isn't in the `sum` of its aggregates.",
                'pages.activity.widgets.0.settings.group: A line of a `series` needs a period of a date: `day:created_at`.',
                'pages.activity.widgets.0.settings.sources.2.period: The list of `emails` has no `date-range` filter `status`.',
                'pages.activity.widgets.0.settings.sources.2.alert.query.filter[color]: The list of `emails` has no filter `color`.',
                'pages.activity.widgets.1.settings.rows: Its trends have different periods (day, week): they share one.',
            ]);
        });

        it('refuse a source that follows the period of an overview without one', () => {
            expect(messages(withWidgets([SOURCES], false))).toEqual([
                'pages.activity.widgets.0.settings.period: Its dashboard has no `period`.',
            ]);
            const rows = withWidgets(
                [
                    {
                        id: 'rows',
                        type: 'table',
                        settings: { rows: [{ resource: 'emails', label: 'E', period: 'sent_at' }] },
                    },
                ],
                false,
            );
            expect(messages(rows)).toEqual([
                'pages.activity.widgets.0.settings.rows.0.period: Its overview has no `period`.',
            ]);
        });

        it('refuse a format that Intl.NumberFormat would not take', () => {
            expect(WidgetNumberFormat.safeParse({ style: 'unit', unit: 'megabyte' }).success).toBe(
                true,
            );
            expect(
                WidgetNumberFormat.safeParse({ style: 'unit', unit: 'kilometer-per-hour' }).success,
            ).toBe(true);
            expect(WidgetNumberFormat.safeParse({ style: 'currency' }).success).toBe(false);
            expect(WidgetNumberFormat.safeParse({ style: 'unit', unit: 'parsec' }).success).toBe(
                false,
            );
            expect(
                WidgetNumberFormat.safeParse({ minimumFractionDigits: 3, maximumFractionDigits: 1 })
                    .success,
            ).toBe(false);
        });
    });

    describe('their data', () => {
        const metric = {
            value: 40,
            previous: 32,
            help: 'Sent to members',
            url: '/emails',
            points: [
                { date: '2026-10-05', value: 12 },
                { date: '2026-10-06', value: 28 },
            ],
            period: 'day',
            parts: [{ label: 'Sent', value: 38, key: 'sent', tone: 'success' }],
            other: 2,
            format: { style: 'currency', currency: 'USD' },
        };
        const table = {
            columns: [
                { key: 'cost', label: 'Cost', format: { style: 'currency', currency: 'USD' } },
                { key: 'calls', label: 'Calls', align: 'end' },
            ],
            rows: [
                {
                    label: 'Summaries',
                    url: '/runs',
                    cells: { cost: 9.08, calls: { value: 6, tone: 'danger', help: 'failed' } },
                    points: [{ date: '2026-10-05', value: 3 }],
                },
                { label: 'Translations', cells: { cost: null } },
            ],
        };
        const series = {
            period: 'day',
            points: [],
            series: [
                {
                    label: 'Emails',
                    points: [{ date: '2026-10-05', value: 3 }],
                    total: 3,
                    alert: { value: 4, label: 'failed', tone: 'danger' },
                },
                { label: 'Texts', points: [], help: 'Since Monday', url: '/texts', key: 'texts' },
            ],
        };

        it('have the shapes of their types, in the checks and in the schemas', () => {
            expect(checkWidgetData('metric', metric)).toEqual([]);
            expect(checkWidgetData('metric', { value: 3 })).toEqual([]);
            expect(checkWidgetData('table', table)).toEqual([]);
            expect(checkWidgetData('series', series)).toEqual([]);
            expect(widgetDataSchemas.metric.safeParse(metric).success).toBe(true);
            expect(widgetDataSchemas.table.safeParse(table).success).toBe(true);
            expect(widgetDataSchemas.series.safeParse(series).success).toBe(true);
        });

        it('name their wrong keys', () => {
            expect(
                checkWidgetData('metric', {
                    value: '3',
                    previous: 'x',
                    points: [
                        { date: '2026-10-06', value: 1 },
                        { date: '2026-10-05', value: 1 },
                    ],
                    parts: [{ label: 'A' }],
                    format: { style: 'currency' },
                }),
            ).toEqual(['value', 'format.currency', 'previous', 'points.1.date', 'parts.0.value']);
            expect(
                checkWidgetData('table', {
                    columns: [
                        { key: 'a', label: 'A' },
                        { key: 'a', label: 'B', align: 'middle' },
                    ],
                    rows: [{ label: 'R', cells: { a: '3' } }],
                }),
            ).toEqual(['columns.1.key', 'columns.1.align', 'rows.0.cells.a']);
            expect(checkWidgetData('table', { columns: [], rows: [] })).toEqual(['columns']);
            expect(
                checkWidgetData('series', {
                    period: 'day',
                    points: [],
                    series: [{ points: [{ date: 'x', value: 1 }], alert: { value: 'x' } }],
                }),
            ).toEqual([
                'series.0.label',
                'series.0.points.0.date',
                'series.0.alert.value',
                'series.0.alert.label',
            ]);
            expect(
                widgetDataSchemas.series.safeParse({
                    ...series,
                    series: [
                        ...series.series,
                        ...series.series,
                        ...series.series,
                        ...series.series,
                    ],
                }).success,
            ).toBe(false);
        });

        it('are empty without a value, items or rows', () => {
            expect(isWidgetDataEmpty('stat', { value: 0 })).toBe(true);
            expect(isWidgetDataEmpty('stat', { value: 1 })).toBe(false);
            expect(isWidgetDataEmpty('metric', { value: 0, previous: 0 })).toBe(true);
            // A fall to 0 is news
            expect(isWidgetDataEmpty('metric', { value: 0, previous: 4 })).toBe(false);
            expect(isWidgetDataEmpty('series', { period: 'day', points: [] })).toBe(true);
            expect(
                isWidgetDataEmpty('series', {
                    period: 'day',
                    points: [],
                    series: [{ label: 'A', points: [{ date: '2026-10-05', value: 0 }] }],
                }),
            ).toBe(true);
            expect(isWidgetDataEmpty('series', series)).toBe(false);
            expect(isWidgetDataEmpty('breakdown', { items: [], other: 0 })).toBe(true);
            expect(isWidgetDataEmpty('breakdown', { items: [], other: 3 })).toBe(false);
            expect(isWidgetDataEmpty('list', { items: [] })).toBe(true);
            expect(isWidgetDataEmpty('table', { columns: [], rows: [] })).toBe(true);
            expect(isWidgetDataEmpty('table', table)).toBe(false);
            expect(isWidgetDataEmpty('weather', {})).toBe(false);
        });
    });

    it('read a format, the settings over the data, without what Intl.NumberFormat would refuse', () => {
        expect(
            readWidgetFormat(
                { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 },
                { currency: 'USD' },
            ),
        ).toEqual({ style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        expect(readWidgetFormat({ style: 'unit', unit: 'parsec', notation: 'compact' })).toEqual({
            notation: 'compact',
        });
        expect(readWidgetFormat({ minimumFractionDigits: 3, maximumFractionDigits: 1 })).toBe(
            undefined,
        );
        expect(readWidgetFormat(null, undefined, 'x')).toBeUndefined();
    });

    it('measure a change, colored only when the widget says which way is good', () => {
        expect(getWidgetChange(40, 32)).toEqual({ difference: 8, ratio: 0.25, direction: 'up' });
        expect(getWidgetChange(3, 0)).toEqual({ difference: 3, ratio: null, direction: 'up' });
        expect(getWidgetChange(-2, -4)).toEqual({ difference: 2, ratio: 0.5, direction: 'up' });
        expect(getWidgetChange(5, 5).direction).toBe('none');
        expect(getChangeTone('up', 'up')).toBe('success');
        expect(getChangeTone('up', 'down')).toBe('danger');
        expect(getChangeTone('down', 'down')).toBe('success');
        expect(getChangeTone('up', undefined)).toBeNull();
        expect(getChangeTone('none', 'up')).toBeNull();
    });

    it('compare a period with the days before it, or the same days a month or a year before', () => {
        expect(getPreviousRange({ from: '2026-11-12', to: '2026-11-18' }, '7d')).toEqual({
            from: '2026-11-05',
            to: '2026-11-11',
        });
        expect(getPreviousRange({ from: '2026-10-20', to: '2026-11-18' })).toEqual({
            from: '2026-09-20',
            to: '2026-10-19',
        });
        expect(getPreviousRange({ from: '2026-11-01', to: '2026-11-18' }, 'month')).toEqual({
            from: '2026-10-01',
            to: '2026-10-18',
        });
        expect(getPreviousRange({ from: '2026-03-01', to: '2026-03-31' }, 'month')).toEqual({
            from: '2026-02-01',
            to: '2026-02-28',
        });
        expect(getPreviousRange({ from: '2025-12-01', to: '2026-11-18' }, 'year')).toEqual({
            from: '2024-12-01',
            to: '2025-11-18',
        });
    });

    it('are 404 at GET /dashboard/widgets/{widget} when they read resources', async () => {
        const backend = createMockBackend({
            definition: withWidgets([SOURCES, { id: 'own', type: 'table' }]),
            widgets: {
                messages: { period: 'day', points: [] },
                own: { columns: [{ key: 'a', label: 'A' }], rows: [] },
            },
        });
        const get = (id: string) =>
            backend.fetch(`/panneau/api/dashboard/widgets/${id}?page=activity`);
        expect((await get('messages')).status).toBe(404);
        expect((await get('own')).status).toBe(200);
    });
});
