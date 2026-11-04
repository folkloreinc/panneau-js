import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { createMockBackend } from './mock';
import type { DefinitionInput, Widget } from './schemas';
import { widgetDataSchemas } from './schemas';
import { validateDefinition } from './validate';
import { checkWidgetData, getWidgetResource } from './widgets';

function withWidgets(widgets: Widget[]): DefinitionInput {
    return { ...createDefinition(), dashboard: { widgets } };
}

const messages = (definition: DefinitionInput) => {
    const result = validateDefinition(definition);
    return result.success ? [] : result.issues.map((issue) => `${issue.path}: ${issue.message}`);
};

describe('getWidgetResource', () => {
    it('reads the resource and the query of a stat or a list on a resource', () => {
        const read = getWidgetResource({
            type: 'stat',
            settings: {
                resource: 'pages',
                query: { 'filter[status]': 'draft', 'filter[tags][]': ['a', 'b'], page: '3' },
            },
        });
        expect(read?.resource).toBe('pages');
        expect(read?.params.toString()).toBe(
            'filter%5Bstatus%5D=draft&filter%5Btags%5D%5B%5D=a&filter%5Btags%5D%5B%5D=b',
        );
        expect(read?.query).toEqual({ filter: { status: 'draft', tags: ['a', 'b'] } });
    });

    it('is null for widgets with data of their own, and for widgets of plugins', () => {
        expect(getWidgetResource({ type: 'stat' })).toBeNull();
        expect(getWidgetResource({ type: 'series', settings: { resource: 'pages' } })).toBeNull();
        expect(getWidgetResource({ type: 'map', settings: { resource: 'pages' } })).toBeNull();
    });
});

describe('the data of the widgets', () => {
    const valid: [string, unknown][] = [
        ['stat', { value: 12, help: '3 more than last week', tone: 'warning', url: '/x' }],
        ['stat', { value: 0, help: null, tone: null }],
        [
            'series',
            {
                period: 'day',
                points: [
                    { date: '2026-10-05', value: 4 },
                    { date: '2026-10-06', value: 8 },
                ],
                total: 12,
            },
        ],
        ['series', { period: 'month', points: [] }],
        [
            'list',
            {
                items: [
                    {
                        title: 'Spring contest',
                        description: null,
                        meta: '12 answers',
                        url: '/contests/1',
                        badge: { label: 'Open', tone: 'success' },
                    },
                    { title: 'Fall contest' },
                ],
                empty: 'No open contests.',
            },
        ],
        ['map', { anything: [1, 2] }],
    ];
    const invalid: [string, unknown, string[]][] = [
        ['stat', { value: '12' }, ['value']],
        ['stat', { value: 12, tone: 'Warning!', url: 3 }, ['tone', 'url']],
        ['stat', [], ['']],
        ['series', { period: 'year', points: {} }, ['period', 'points']],
        [
            'series',
            {
                period: 'week',
                points: [
                    { date: '2026-10-12', value: 1 },
                    { date: '2026-10-05', value: 2 },
                    { date: '2026-10-19', value: 'x' },
                ],
                total: '3',
            },
            ['points.1.date', 'points.2.value', 'total'],
        ],
        [
            'list',
            { items: [{ description: 'No title', badge: { tone: 'success' } }], empty: 1 },
            ['items.0.title', 'items.0.badge', 'empty'],
        ],
        [
            'list',
            { items: Array.from({ length: 6 }, (_, index) => ({ title: String(index) })) },
            ['items'],
        ],
        ['map', 'text', ['']],
    ];
    const schemaAccepts = (type: string, data: unknown) =>
        type in widgetDataSchemas
            ? widgetDataSchemas[type as keyof typeof widgetDataSchemas].safeParse(data).success
            : typeof data === 'object' && data !== null && !Array.isArray(data);

    it.each(valid)('accepts a %s in its shape, in the schemas too', (type, data) => {
        expect(checkWidgetData(type, data)).toEqual([]);
        expect(schemaAccepts(type, data)).toBe(true);
    });

    it.each(invalid)(
        'names the wrong keys of a %s, which the schemas refuse too',
        (type, data, wrong) => {
            expect(checkWidgetData(type, data)).toEqual(wrong);
            expect(schemaAccepts(type, data)).toBe(false);
        },
    );
});

describe('the widgets of the definition', () => {
    it('accepts stats and lists on a resource, with filters of its list', () => {
        expect(
            messages(
                withWidgets([
                    {
                        id: 'drafts',
                        type: 'stat',
                        settings: { resource: 'pages', query: { 'filter[status]': 'draft' } },
                    },
                    {
                        id: 'latest',
                        type: 'list',
                        settings: { resource: 'pages', query: { sort: '-published_at' } },
                    },
                    { id: 'visits', type: 'series', width: 6 },
                    { id: 'map', type: 'map', settings: { anything: true } },
                ]),
            ),
        ).toEqual([]);
    });

    it('refuses duplicate ids, unknown resources and filters, and a series on a resource', () => {
        expect(
            messages(
                withWidgets([
                    { id: 'a', type: 'stat', settings: { resource: 'nope' } },
                    { id: 'a', type: 'series', settings: { resource: 'pages' } },
                    {
                        id: 'b',
                        type: 'list',
                        settings: {
                            resource: 'pages',
                            query: { 'filter[color]': 'red', perPage: 10 },
                        },
                    },
                    { id: 'c', type: 'stat', settings: { query: { q: 'x' } } },
                ]),
            ),
        ).toEqual([
            'dashboard.widgets.0.settings.resource: No resource `nope`.',
            'dashboard.widgets.1.id: Duplicate widget id `a`.',
            'dashboard.widgets.1.settings.resource: A `series` widget has data of its own: only `stat` and `list` read a resource.',
            'dashboard.widgets.2.settings.query.filter[color]: The list of `pages` has no filter `color`.',
            'dashboard.widgets.2.settings.query.perPage: The client sets `perPage`.',
            'dashboard.widgets.3.settings.query: `query` goes with a `resource`.',
        ]);
    });

    it('refuses a stat on a list paged with cursors, which has no total', () => {
        const definition = withWidgets([
            { id: 'count', type: 'stat', settings: { resource: 'pages' } },
        ]);
        definition.resources = definition.resources.map((resource) =>
            resource.id === 'pages'
                ? { ...resource, list: { ...resource.list, pagination: 'cursor' as const } }
                : resource,
        );
        expect(messages(definition)).toEqual([
            "dashboard.widgets.0.settings.resource: The list of `pages` is paged with cursors and has no total: it can't feed a `stat`.",
        ]);
    });
});

describe('the widgets of the mock backend', () => {
    const fetchWidget = async (backend: ReturnType<typeof createMockBackend>, id: string) => {
        const response = await backend.fetch(`/panneau/api/dashboard/widgets/${id}`);
        return {
            status: response.status,
            body: (await response.json()) as Record<string, unknown>,
        };
    };

    function createBackend() {
        return createMockBackend({
            definition: withWidgets([
                { id: 'drafts', type: 'stat', settings: { resource: 'pages' } },
                { id: 'visits', type: 'series' },
                { id: 'count', type: 'stat' },
                { id: 'broken', type: 'list' },
                { id: 'secret', type: 'stat' },
                { id: 'empty', type: 'stat' },
            ]),
            items: { pages: [{ title: 'A' }, { title: 'B' }] },
            widgets: {
                visits: { period: 'day', points: [{ date: '2026-10-05', value: 4 }], total: 4 },
                count: ({ items }) => ({ value: items('pages').length }),
                broken: { items: [{ name: 'No title' }] },
                secret: new Response(null, { status: 403 }),
            },
        });
    }

    it('answers the data of a widget, or of its function', async () => {
        const backend = createBackend();
        expect(await fetchWidget(backend, 'visits')).toMatchObject({
            status: 200,
            body: { period: 'day', total: 4 },
        });
        expect(await fetchWidget(backend, 'count')).toEqual({ status: 200, body: { value: 2 } });
        expect((await backend.fetch('/panneau/api/dashboard/widgets/secret')).status).toBe(403);
    });

    it('answers a 500 that names the wrong keys of data in the wrong shape', async () => {
        const { status, body } = await fetchWidget(createBackend(), 'broken');
        expect(status).toBe(500);
        expect(body.detail).toBe('Wrong keys: items.0.title.');
    });

    it('answers a 404 for widgets without data, on a resource, or not in the dashboard', async () => {
        const backend = createBackend();
        for (const id of ['empty', 'drafts', 'nope']) {
            expect((await fetchWidget(backend, id)).status).toBe(404);
        }
    });
});
