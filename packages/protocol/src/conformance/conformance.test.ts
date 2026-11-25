import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createMockBackend } from '../mock';
import { getPeriodRange } from '../periods';
import { formatReport, runConformance } from './index';

function createBackend() {
    const definition = createDefinition();
    // Required to create a page only, like a password.
    definition.resources[0]?.fields.push({
        name: 'code',
        type: 'text',
        rules: [{ rule: 'required', mode: 'create' }],
    });
    // An address and a link, whose parts are checked (decisions 0054 and 0055).
    definition.resources[0]?.fields.push(
        { name: 'venue', type: 'address' },
        { name: 'cta', type: 'link', resource: 'pages' },
    );
    // A trash: the delete of pages is undone by restore (decision 0063).
    definition.resources[0]?.actions?.push({
        id: 'delete',
        undoable: true,
        scope: ['item', 'selection'],
    });
    // Abilities of the user (decision 0046): a field they can't see, a resource they can't reach.
    definition.resources[0]?.fields.push({
        name: 'notes',
        type: 'textarea',
        abilities: { view: false },
    });
    // A field that only items give, which forms leave out (decision 0071).
    definition.resources[0]?.fields.push({ name: 'url', type: 'text', notInForm: true });
    // Types whose rules are implied (decision 0053).
    definition.resources[0]?.fields.push(
        { name: 'dates', type: 'daterange', settings: { open: 'end' } },
        { name: 'price', type: 'money', settings: { currency: 'CAD' } },
    );
    // What the list can sum and group by (decision 0084).
    const list = definition.resources[0]?.list;
    if (list !== undefined) {
        list.aggregates = { sum: ['price'], groupBy: ['status'], dates: ['published_at'] };
    }
    // A summary above the list (decision 0084): a widget on the resource, one with data of its own.
    const pages = definition.resources[0];
    if (pages !== undefined) {
        pages.summary = {
            widgets: [
                {
                    id: 'pages-by-status',
                    type: 'breakdown',
                    settings: { resource: 'pages', group: 'status' },
                },
                { id: 'health', type: 'stat' },
            ],
            // The period of the summary is the list's date-range filter (decision 0084)
            period: { options: ['30d', 'year'] },
        };
    }
    definition.resources.push({
        id: 'settings',
        label: { singular: 'setting', plural: 'settings' },
        fields: [{ name: 'name', type: 'text' }],
        abilities: { viewAny: false, create: false },
    });
    // A context of two params: inline choices, then choices that depend on them.
    definition.context = {
        params: [
            {
                name: 'site',
                label: 'Site',
                required: true,
                options: [
                    { value: 'main', label: 'Main site' },
                    { value: 'kids', label: 'Kids' },
                ],
            },
            { name: 'section', label: 'Section', allLabel: 'All sections' },
        ],
    };
    // Password reset and email verification (decision 0048).
    definition.auth = {
        mode: 'panneau',
        passwordReset: true,
        emailVerification: true,
        twoFactor: true,
        account: true,
        passkeys: true,
        providers: [
            { id: 'google', label: 'Google', url: '/panneau/api/auth/providers/google/redirect' },
        ],
    };
    // The MCP server, whose connections the account lists (decision 0113).
    definition.agents = { mcp: { url: '/panneau/mcp', tokens: true } };
    // A dashboard (decision 0064): widgets on a resource, and widgets with data of their own.
    definition.dashboard = {
        widgets: [
            {
                id: 'drafts',
                type: 'stat',
                settings: { resource: 'pages', query: { 'filter[status]': 'draft' } },
            },
            {
                id: 'latest',
                type: 'list',
                settings: { resource: 'pages', query: { sort: '-title' } },
            },
            { id: 'visits', type: 'series' },
            { id: 'map', type: 'map' },
            // On the aggregates of a resource (decision 0084)
            {
                id: 'per-week',
                type: 'series',
                settings: { resource: 'pages', group: 'week:published_at' },
            },
            {
                id: 'by-status',
                type: 'breakdown',
                settings: { resource: 'pages', group: 'status' },
            },
            {
                id: 'revenue',
                type: 'stat',
                settings: { resource: 'pages', measure: 'sum:price', target: 100000 },
            },
            // Combined widgets (decision 0089): on resources, and with data of their own
            {
                id: 'published-metric',
                type: 'metric',
                settings: {
                    resource: 'pages',
                    points: 'week:published_at',
                    by: 'status',
                    goodWhen: 'up',
                },
            },
            {
                id: 'per-status',
                type: 'series',
                settings: { resource: 'pages', group: 'week:published_at', split: 'status' },
            },
            {
                id: 'pages-table',
                type: 'table',
                settings: {
                    rows: [
                        { resource: 'pages', label: 'Pages', points: 'month:published_at' },
                        {
                            resource: 'pages',
                            label: 'Revenue',
                            measure: 'sum:price',
                            alert: { query: { 'filter[status]': 'draft' }, label: 'drafts' },
                        },
                    ],
                },
            },
            { id: 'storage', type: 'metric', settings: { hideEmpty: true } },
            { id: 'costs', type: 'table' },
        ],
    };
    // A dashboard page of its own (decision 0084).
    definition.pages = {
        activity: {
            component: 'dashboard',
            label: 'Activity',
            period: { options: ['7d', '30d', 'month'], default: '30d' },
            widgets: [
                { id: 'signups', type: 'stat' },
                { id: 'published', type: 'list', settings: { resource: 'pages' } },
                // On the aggregates of a resource, on a page other than home
                {
                    id: 'published-per-month',
                    type: 'series',
                    settings: {
                        resource: 'pages',
                        query: { 'filter[status]': 'published' },
                        group: 'month:published_at',
                    },
                },
            ],
        },
    };
    return createMockBackend({
        definition,
        widgets: {
            visits: { period: 'week', points: [{ date: '2026-10-05', value: 4 }], total: 4 },
            map: { pins: [] },
            signups: { value: 3 },
            storage: { value: 1530, previous: 1700, format: { style: 'unit', unit: 'megabyte' } },
            costs: {
                columns: [{ key: 'cost', label: 'Cost' }],
                rows: [{ label: 'Summaries', cells: { cost: 9.08 } }],
            },
            health: ({ query }) => ({ value: query.q !== undefined ? 0 : 1 }),
        },
        auth: { users: [{ email: 'ada@example.com', password: 'secret' }] },
        context: {
            options: (name, before) =>
                name === 'section' && before.site !== undefined
                    ? [{ value: `${before.site}-news`, label: 'News' }]
                    : [],
        },
        items: {
            pages: [
                {
                    title: { fr: 'Accueil', en: 'Home' },
                    status: 'published',
                    published_at: '2026-10-01T12:00:00Z',
                    notes: 'Internal',
                    price: { amount: 1250, currency: 'CAD' },
                },
                { title: { fr: 'Contact', en: 'Contact' }, status: 'draft', published_at: null },
                {
                    title: { fr: 'Archives', en: 'Archives' },
                    status: 'published',
                    published_at: null,
                    abilities: { update: false, delete: false },
                },
            ],
        },
    });
}

const writes = {
    create: { title: { fr: 'Nouvelle', en: 'New' }, status: 'draft', code: 'secret' },
    update: { status: 'published', published_at: '2026-10-14T12:00:00Z' },
};

describe('runConformance', () => {
    it('passes against the mock backend', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
            writes,
        });
        expect(formatReport(report)).not.toContain('✗');
        expect(report.passed).toBe(true);
        expect(report.checks.filter((check) => check.status === 'skipped')).toEqual([]);
    });

    it('fails a backend whose undoable action gives no undo, or whose undo leaves the item out', async () => {
        const backend = createBackend();
        // A backend that forgets the undo of its delete
        const forgets = (input: string, init?: RequestInit) =>
            backend.fetch(input, init).then(async (response) => {
                if (!input.endsWith('/actions/delete')) {
                    return response;
                }
                const { undo: _undo, ...result } = (await response.json()) as Record<
                    string,
                    unknown
                >;
                return new Response(JSON.stringify(result), {
                    status: response.status,
                    headers: response.headers,
                });
            });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: forgets,
            writes,
        });
        expect(report.checks.find((check) => check.id === 'action.undo')).toMatchObject({
            status: 'failed',
            issues: [expect.stringContaining('has no `undo`')],
        });
        // A backend whose restore does nothing
        const ignoring = createBackend();
        const ignores = (input: string, init?: RequestInit) =>
            input.endsWith('/actions/restore')
                ? Promise.resolve(
                      new Response(
                          JSON.stringify({ summary: { succeeded: 1, failed: 0, skipped: 0 } }),
                          {
                              status: 200,
                              headers: { 'Content-Type': 'application/json' },
                          },
                      ),
                  )
                : ignoring.fetch(input, init);
        const ignored = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: ignores,
            writes,
        });
        expect(ignored.checks.find((check) => check.id === 'action.undo')?.issues).toEqual([
            'After the undo, the item is not back.',
        ]);
    });

    it('fails widgets whose data does not have the shape of their type', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: (input, init) =>
                input.endsWith('/dashboard/widgets/visits')
                    ? Promise.resolve(
                          new Response(JSON.stringify({ period: 'year', points: [] }), {
                              headers: { 'Content-Type': 'application/json' },
                          }),
                      )
                    : backend.fetch(input, init),
        });
        const check = report.checks.find(({ id }) => id === 'dashboard.widgets');
        expect(check?.status).toBe('failed');
        expect(check?.issues.join('\n')).toContain('The data of the series "visits"');
    });

    it('fails aggregates that skip empty periods, ignore the range, or accept what is not declared', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: async (input, init) => {
                const url = new URL(input);
                if (!url.pathname.endsWith('/aggregate')) {
                    return backend.fetch(input, init);
                }
                const group = url.searchParams.get('group');
                const answer = group?.startsWith('day:')
                    ? // Only the periods with items, and none of the range
                      { period: 'day', points: [{ date: '2026-10-01', value: 1 }], total: 1 }
                    : group?.startsWith('week:')
                      ? {
                            period: 'week',
                            points: [
                                { date: '2026-09-28', value: 1 },
                                { date: '2026-10-12', value: 1 },
                            ],
                        }
                      : group === null
                        ? { value: 0 }
                        : { items: [] };
                return new Response(JSON.stringify(answer), {
                    headers: { 'Content-Type': 'application/json' },
                });
            },
        });
        const aggregate = report.checks.find(({ id }) => id === 'list.aggregate');
        expect(aggregate?.status).toBe('failed');
        expect(aggregate?.issues.join('\n')).toContain(
            'after 2026-09-28, expected a point on 2026-10-05, got 2026-10-12.',
        );
        expect(aggregate?.issues.join('\n')).toContain(
            'expected a point per day from 2026-01-01 to 2026-01-07, got 2026-10-01 to 2026-10-01.',
        );
        expect(aggregate?.issues.join('\n')).toContain(
            'The count of "pages" is 0; its list has 3 items.',
        );
        const invalid = report.checks.find(({ id }) => id === 'list.aggregate.invalid');
        expect(invalid?.status).toBe('failed');
        expect(invalid?.issues[0]).toBe('Expected status 422, got 200.');
    });

    it('asks for the widgets of each dashboard page with its page, and only there', async () => {
        const backend = createBackend();
        const requested: string[] = [];
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: (input, init) => {
                requested.push(input);
                return backend.fetch(input, init);
            },
        });
        expect(report.checks.find(({ id }) => id === 'dashboard.widgets')?.status).toBe('passed');
        expect(requested).toContain(
            'http://panneau.test/panneau/api/dashboard/widgets/signups?page=activity',
        );
        expect(requested).toContain('http://panneau.test/panneau/api/dashboard/widgets/visits');
    });

    it('fails a backend that answers a widget on a page it is not on', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            // A backend that ignores `page`
            fetch: (input, init) =>
                backend.fetch(
                    input.includes('/dashboard/widgets/') ? input.replace(/\?page=.*$/, '') : input,
                    init,
                ),
        });
        const check = report.checks.find(({ id }) => id === 'dashboard.widgets.unknown');
        expect(check?.status).toBe('failed');
        expect(check?.issues).toContain(
            'Widget "visits" on the page "activity": expected status 404, got 200.',
        );
    });

    it('asks for the widgets of a summary with its resource, and only there', async () => {
        const backend = createBackend();
        const requested: string[] = [];
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: (input, init) => {
                requested.push(input);
                return backend.fetch(input, init);
            },
        });
        expect(report.checks.find(({ id }) => id === 'dashboard.widgets')?.status).toBe('passed');
        expect(report.checks.find(({ id }) => id === 'dashboard.widgets.unknown')?.status).toBe(
            'passed',
        );
        expect(requested).toContain(
            'http://panneau.test/panneau/api/dashboard/widgets/health?resource=pages',
        );
        expect(requested).toContain(
            'http://panneau.test/panneau/api/dashboard/widgets/health?resource=pages&page=home',
        );
    });

    it('fails a backend that ignores the resource of a summary', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            // A backend that reads every widget as one of the home page
            fetch: (input, init) =>
                backend.fetch(
                    input.includes('/dashboard/widgets/')
                        ? input.replace(/\?resource=.*$/, '')
                        : input,
                    init,
                ),
        });
        expect(report.checks.find(({ id }) => id === 'dashboard.widgets')?.issues).toContain(
            'Widget "health" of the summary of "pages": expected status 200, got 404.',
        );
        expect(
            report.checks.find(({ id }) => id === 'dashboard.widgets.unknown')?.issues,
        ).toContain(
            'Widget "health" of the summary of "pages" with both a page and a resource: expected status 422, got 404.',
        );
    });

    it('asks for the widgets that follow a period with its parameters (decision 0084)', async () => {
        const backend = createBackend();
        const requested: string[] = [];
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: (input, init) => {
                requested.push(decodeURIComponent(input));
                return backend.fetch(input, init);
            },
        });
        expect(report.checks.find(({ id }) => id === 'dashboard.widgets.period')?.status).toBe(
            'passed',
        );
        const { from, to } = getPeriodRange('30d');
        expect(requested).toContain(
            `http://panneau.test/panneau/api/dashboard/widgets/signups?page=activity&period[option]=30d&period[from]=${from}&period[to]=${to}`,
        );
        expect(requested).toContain(
            `http://panneau.test/panneau/api/dashboard/widgets/health?resource=pages&period[option]=30d&period[from]=${from}&period[to]=${to}`,
        );
    });

    it('fails a backend that accepts a wrong period', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            // A backend that ignores the period
            fetch: (input, init) => backend.fetch(input.replace(/[?&]period%5B.*$/, ''), init),
        });
        const check = report.checks.find(({ id }) => id === 'dashboard.widgets.period');
        expect(check?.status).toBe('failed');
        expect(check?.issues[0]).toMatch(/for the period "decade": expected status 422, got 200/);
    });

    it('checks a list paged with cursors: the next page, and an invalid cursor', async () => {
        const definition = createDefinition();
        const cursorDefinition = {
            ...definition,
            resources: definition.resources.map((resource) =>
                resource.id === 'pages'
                    ? { ...resource, list: { ...resource.list, pagination: 'cursor' as const } }
                    : resource,
            ),
        };
        const backend = createMockBackend({
            definition: cursorDefinition,
            items: {
                pages: [{ title: { fr: 'A' } }, { title: { fr: 'B' } }, { title: { fr: 'C' } }],
            },
        });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
            resource: 'pages',
        });
        expect(report.checks.find((check) => check.id === 'list')).toMatchObject({
            status: 'passed',
        });

        // A backend that ignores the cursor: its next page repeats the first, and it reads anything.
        const ignoring = (input: string, init?: RequestInit) =>
            backend.fetch(input.replace(/([?&])cursor=[^&]*&?/, '$1'), init);
        const broken = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: ignoring,
            resource: 'pages',
        });
        const list = broken.checks.find((check) => check.id === 'list');
        expect(list?.status).toBe('failed');
        expect(list?.issues.join('\n')).toMatch(/repeats items of the first page/);
        expect(list?.issues.join('\n')).toMatch(/Expected status 422/);
    });

    it('reports a backend that ignores the abilities it announces', async () => {
        const backend = createBackend();
        // A backend that answers as if every ability were allowed, and sends hidden values.
        const ignoring = async (input: string, init?: RequestInit): Promise<Response> => {
            const method = init?.method ?? 'GET';
            if (input.endsWith('/resources/settings')) {
                return new Response(
                    JSON.stringify({
                        data: [],
                        meta: { page: 1, perPage: 20, total: 0, lastPage: 1 },
                    }),
                    {
                        status: method === 'POST' ? 201 : 200,
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            }
            if (method === 'PATCH') {
                return new Response(null, { status: 200 });
            }
            const response = await backend.fetch(input, init);
            if (method !== 'GET' || !/\/resources\/pages\?/.test(input)) {
                return response;
            }
            const body = (await response.json()) as { data: Record<string, unknown>[] };
            body.data.forEach((item) => (item.notes = 'Internal'));
            return new Response(JSON.stringify(body), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: ignoring,
            writes,
        });
        const failed = report.checks.filter((check) => check.status === 'failed');
        expect(failed.map((check) => check.id)).toEqual(
            expect.arrayContaining([
                'abilities.view-any',
                'abilities.fields',
                'abilities.create',
                'abilities.update',
            ]),
        );
        expect(failed.find((check) => check.id === 'abilities.fields')?.issues[0]).toContain(
            'notes',
        );
    });

    it('reports a backend whose dry run of `delete` doesn’t skip what can’t be deleted', async () => {
        const backend = createBackend();
        const allowing = async (input: string, init?: RequestInit): Promise<Response> =>
            input.endsWith('/actions/delete') && String(init?.body).includes('"dryRun":true')
                ? new Response(
                      JSON.stringify({ summary: { succeeded: 1, failed: 0, skipped: 0 } }),
                      { status: 200, headers: { 'Content-Type': 'application/json' } },
                  )
                : backend.fetch(input, init);
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: allowing,
        });
        expect(report.checks.find((check) => check.id === 'abilities.delete')).toMatchObject({
            status: 'failed',
        });
    });

    it('checks the context: its choices, the definition for a value, and a refused value', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        const statuses = Object.fromEntries(report.checks.map((check) => [check.id, check.status]));
        expect(statuses).toMatchObject({
            'context.options': 'passed',
            'context.value': 'passed',
            'context.refused': 'passed',
        });

        // A backend that ignores the header: its definition is for no value, and it refuses nothing.
        const ignoring = (input: string, init?: RequestInit) => {
            const headers = new Headers(init?.headers);
            headers.delete('Panneau-Context');
            return backend.fetch(input, { ...init, headers });
        };
        const broken = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: ignoring,
        });
        const failed = broken.checks.filter((check) => check.status === 'failed');
        expect(failed.map((check) => check.id)).toEqual(['context.value', 'context.refused']);
    });

    it('checks a context whose first param is fixed by the backend', async () => {
        const definition = createDefinition();
        definition.context = {
            params: [
                { name: 'client', label: 'Client', fixed: true, value: '4', valueLabel: 'Acme' },
                { name: 'contest', label: 'Contest', options: [{ value: '12', label: 'Summer' }] },
            ],
        };
        const backend = createMockBackend({ definition, items: { pages: [{ title: 'A' }] } });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        const statuses = Object.fromEntries(report.checks.map((check) => [check.id, check.status]));
        expect(statuses).toMatchObject({
            'context.options': 'passed',
            'context.value': 'passed',
            'context.refused': 'passed',
        });
    });

    it('checks password reset and email verification when the definition has them', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        const statuses = Object.fromEntries(report.checks.map((check) => [check.id, check.status]));
        expect(statuses).toMatchObject({
            'auth.password-forgot': 'passed',
            'auth.password-reset': 'passed',
            'auth.email-verify': 'passed',
            'account.two-factor': 'passed',
            account: 'passed',
            'auth.passkeys': 'passed',
            'auth.providers': 'passed',
            'account.passkeys': 'passed',
            'account.connections': 'passed',
            'auth.two-factor-challenge': 'passed',
        });

        // A backend that tells which addresses have an account, and accepts any token.
        const revealing = async (input: string, init?: RequestInit) => {
            const path = new URL(input).pathname;
            if (path.endsWith('/auth/password/forgot') && init?.body !== '{}') {
                return new Response(
                    JSON.stringify({
                        type: 'about:blank',
                        title: 'Invalid',
                        status: 422,
                        errors: { email: ['We can’t find a user with that email address.'] },
                    }),
                    { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
                );
            }
            if (path.endsWith('/auth/email/verify') || path.endsWith('/auth/password/reset')) {
                return new Response(null, { status: 204 });
            }
            return backend.fetch(input, init);
        };
        const broken = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: revealing,
        });
        const failed = broken.checks.filter((check) => check.status === 'failed');
        expect(failed.map((check) => check.id)).toEqual([
            'auth.password-forgot',
            'auth.password-reset',
            'auth.email-verify',
        ]);

        // Without them, the checks are skipped.
        const plain = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: createMockBackend({ definition: createDefinition() }).fetch,
        });
        expect(
            plain.checks
                .filter((check) => check.id.startsWith('auth.'))
                .map((check) => check.status),
        ).toEqual(['skipped', 'skipped', 'skipped', 'skipped', 'skipped', 'skipped']);
        expect(plain.checks.find((check) => check.id === 'account.two-factor')?.status).toBe(
            'skipped',
        );
    });

    it('skips the write checks unless asked', async () => {
        const backend = createBackend();
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(report.passed).toBe(true);
        expect(
            report.checks.filter((check) => check.status === 'skipped').map((check) => check.id),
        ).toEqual([
            'abilities.create',
            'abilities.update',
            'create.invalid',
            'create.implied-rules',
            'create',
            'update',
            'update.create-rules',
            'update.parts',
            'update.single-field',
            'update.not-in-form',
            'update.conflict',
            'duplicate',
            'action.undo',
            'delete',
        ]);
    });

    it('reports what a backend gets wrong', async () => {
        const backend = createBackend();
        // A backend that drops ETags and answers errors with HTML.
        const broken = async (input: string, init?: RequestInit) => {
            const response = await backend.fetch(input, init);
            if (response.status >= 400) {
                return new Response('<h1>Error</h1>', {
                    status: response.status,
                    headers: { 'Content-Type': 'text/html' },
                });
            }
            const headers = new Headers(response.headers);
            headers.delete('ETag');
            return new Response(response.body, { status: response.status, headers });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: broken,
            writes,
        });
        const failed = report.checks
            .filter((check) => check.status === 'failed')
            .map((check) => check.id);
        expect(report.passed).toBe(false);
        expect(failed).toEqual([
            'context.refused',
            'auth.password-forgot',
            'auth.password-reset',
            'auth.email-verify',
            'auth.providers',
            'auth.passkeys',
            'auth.two-factor-challenge',
            'uploads.sign',
            'fields.check',
            'list.unknown-resource',
            'item',
            'item.missing',
            'search.invalid',
            'list.aggregate.invalid',
            'dashboard.widgets.period',
            'dashboard.widgets.unknown',
            'create.invalid',
            'create.implied-rules',
            'update.parts',
            'update.conflict',
            'duplicate',
            'delete',
        ]);
        expect(formatReport(report)).toContain(
            'Expected content type application/problem+json, got "text/html".',
        );
    });

    it('reports a backend that applies a rule limited to create to updates', async () => {
        const backend = createBackend();
        // A backend that requires the code on every write.
        const strict = async (input: string, init?: RequestInit) => {
            const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as object) : {};
            if (init?.method === 'PATCH' && 'code' in body && body.code === null) {
                return new Response(
                    JSON.stringify({
                        type: 'urn:panneau:problem:validation',
                        title: 'The given data was invalid.',
                        status: 422,
                        errors: { code: ['This field is required.'] },
                    }),
                    { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
                );
            }
            return backend.fetch(input, init);
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: strict,
            writes,
        });
        const check = report.checks.find((candidate) => candidate.id === 'update.create-rules');
        expect(check?.status).toBe('failed');
        expect(check?.issues).toEqual([
            'An update with code set to null got status 422, expected 200.',
        ]);
    });

    it('reports a backend that clears the fields an update of a single field does not send', async () => {
        const backend = createBackend();
        // A backend that replaces the item with the values it gets: a new slug each time.
        let count = 0;
        const replacing = (input: string, init?: RequestInit) => {
            const body =
                init?.method === 'PATCH' && typeof init.body === 'string'
                    ? (JSON.parse(init.body) as Record<string, unknown>)
                    : null;
            return backend.fetch(
                input,
                body !== null && Object.keys(body).length === 1
                    ? {
                          ...init,
                          body: JSON.stringify({
                              slug: { en: `page-${String((count += 1))}` },
                              ...body,
                          }),
                      }
                    : init,
            );
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: replacing,
            writes,
        });
        const check = report.checks.find((candidate) => candidate.id === 'update.single-field');
        expect(check?.status).toBe('failed');
        expect(check?.issues).toEqual(['An update of status alone also changed slug.']);
    });

    it('reports a backend that saves the value of a field that forms leave out', async () => {
        const backend = createBackend();
        const passing = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
            writes,
        });
        expect(passing.checks.find((check) => check.id === 'update.not-in-form')?.status).toBe(
            'passed',
        );
        // A backend that saves every value it gets.
        const saving = async (input: string, init?: RequestInit): Promise<Response> => {
            const response = await backend.fetch(input, init);
            const sent =
                init?.method === 'PATCH' && typeof init.body === 'string'
                    ? (JSON.parse(init.body) as Record<string, unknown>)
                    : null;
            if (sent === null || !('url' in sent) || response.status !== 200) {
                return response;
            }
            const body = (await response.json()) as { data: Record<string, unknown> };
            body.data.url = sent.url;
            return new Response(JSON.stringify(body), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: saving,
            writes,
        });
        const check = report.checks.find((candidate) => candidate.id === 'update.not-in-form');
        expect(check?.status).toBe('failed');
        expect(check?.issues).toEqual(['An update changed url, which forms leave out.']);
    });

    it('reports a backend that ignores the filter on ids', async () => {
        const backend = createBackend();
        const withoutIds = (input: string, init?: RequestInit) => {
            const url = new URL(input);
            url.searchParams.delete('filter[ids][]');
            return backend.fetch(url.toString(), init);
        };
        const passing = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(passing.checks.find((check) => check.id === 'list.filter-ids')?.status).toBe(
            'passed',
        );
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: withoutIds,
        });
        const ids = report.checks.find((check) => check.id === 'list.filter-ids');
        expect(ids?.status).toBe('failed');
        expect(ids?.issues?.[0]).toMatch(/^filter\[ids\]\[\] of .+ listed /);
    });

    it('reports a backend that ignores fields or doesn’t cap perPage', async () => {
        const backend = createBackend();
        const passing = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        const statuses = Object.fromEntries(
            passing.checks.map((check) => [check.id, check.status]),
        );
        expect(statuses).toMatchObject({ 'list.fields': 'passed', 'list.per-page': 'passed' });
        // A backend that also gives the title of items, as laravel-panneau does
        const withTitle = (input: string, init?: RequestInit) => {
            const url = new URL(input);
            const fields = url.searchParams.get('fields');
            if (fields !== null) {
                url.searchParams.set('fields', `${fields},title`);
            }
            return backend.fetch(url.toString(), init);
        };
        const titled = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: withTitle,
        });
        expect(titled.checks.find((check) => check.id === 'list.fields')?.status).toBe('passed');
        // A backend that gives every field, and as many items as asked for
        const careless = async (input: string, init?: RequestInit) => {
            const url = new URL(input);
            const perPage = Number(url.searchParams.get('perPage') ?? '20');
            url.searchParams.delete('fields');
            const response = await backend.fetch(url.toString(), init);
            if (perPage <= 100 || !response.ok) {
                return response;
            }
            const body = (await response.json()) as { data: unknown[]; meta: object };
            return Response.json({ ...body, meta: { ...body.meta, perPage } });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: careless,
        });
        const fields = report.checks.find((check) => check.id === 'list.fields');
        expect(fields?.status).toBe('failed');
        expect(fields?.issues?.[0]).toMatch(/^fields=status also gave the values of /);
        const perPage = report.checks.find((check) => check.id === 'list.per-page');
        expect(perPage?.status).toBe('failed');
        expect(perPage?.issues?.[0]).toMatch(/^perPage=101 answered meta.perPage 101/);
    });

    it('reports a backend that ignores the bounds of a range filter', async () => {
        const backend = createBackend();
        // A backend that only knows `filter[id]` and `filter[id][]`.
        const withoutRanges = (input: string, init?: RequestInit) => {
            const url = new URL(input);
            [...url.searchParams.keys()]
                .filter((key) => /\]\[(from|to)\]$/.test(key))
                .forEach((key) => url.searchParams.delete(key));
            return backend.fetch(url.toString(), init);
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: withoutRanges,
        });
        const range = report.checks.find((check) => check.id === 'list.filter-range');
        expect(range?.status).toBe('failed');
        expect(range?.issues).toEqual([
            'Filtered from 9999-12-31, the list has 3 items, expected 0.',
        ]);
    });

    it('reports a backend that ignores the parameters of the search', async () => {
        const backend = createMockBackend({
            definition: createDefinition(),
            items: { pages: [{ title: { fr: 'Page 1' } }, { title: { fr: 'Page 2' } }] },
        });
        // A backend that only reads `q`, and never refuses it.
        const qOnly = (input: string, init?: RequestInit) => {
            const url = new URL(input);
            if (url.pathname.endsWith('/search')) {
                const q = url.searchParams.get('q') ?? '';
                return backend.fetch(
                    `${url.origin}${url.pathname}?q=${encodeURIComponent(q.padEnd(2, q))}`,
                    init,
                );
            }
            return backend.fetch(input, init);
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: qOnly,
        });
        expect(report.checks.find((check) => check.id === 'search')?.status).toBe('passed');
        expect(
            report.checks
                .filter((check) => check.id.startsWith('search.'))
                .map((check) => [check.id, check.status]),
        ).toEqual([
            ['search.scope', 'failed'],
            ['search.invalid', 'failed'],
        ]);
    });

    it('skips the search checks when the definition disables the global search', async () => {
        const definition = { ...createDefinition(), search: { enabled: false } };
        const backend = createMockBackend({ definition });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(
            report.checks
                .filter((check) => check.id.startsWith('search'))
                .map((check) => [check.status, ...check.issues]),
        ).toEqual([
            ['skipped', 'The definition disables the global search.'],
            ['skipped', 'The definition disables the global search.'],
            ['skipped', 'The definition disables the global search.'],
        ]);
    });

    it('skips the range check when the resource has no date-range filter', async () => {
        const definition = createDefinition();
        definition.resources.forEach((resource) => {
            if (resource.list !== undefined) {
                resource.list.filters = [];
            }
        });
        const backend = createMockBackend({ definition });
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: backend.fetch,
        });
        expect(report.checks.find((check) => check.id === 'list.filter-range')).toMatchObject({
            status: 'skipped',
            issues: ['The resource declares no date-range filter.'],
        });
    });

    it('reports a backend whose copy keeps the id of the item', async () => {
        const backend = createBackend();
        // A backend that answers the item itself instead of a copy.
        const broken = async (input: string, init?: RequestInit) => {
            if (new URL(input).pathname.endsWith('/duplicate')) {
                const item = await backend.fetch(input.replace(/\/duplicate$/, ''));
                return new Response(await item.text(), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            return backend.fetch(input, init);
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: broken,
            writes,
        });
        expect(report.checks.find((check) => check.id === 'duplicate')).toMatchObject({
            status: 'failed',
            issues: expect.arrayContaining(['The copy has the id of the item it copies.']),
        });
    });

    it('reports a backend that only answers the actions it declares', async () => {
        const backend = createBackend();
        const broken = async (input: string, init?: RequestInit) =>
            new URL(input).pathname.endsWith('/actions/delete')
                ? new Response(JSON.stringify({ title: 'Action not found.', status: 404 }), {
                      status: 404,
                      headers: { 'Content-Type': 'application/problem+json' },
                  })
                : backend.fetch(input, init);
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: broken,
        });
        expect(report.checks.find((check) => check.id === 'action.delete')?.status).toBe('failed');
    });

    it('reports a copy without its ETag', async () => {
        const backend = createBackend();
        const broken = async (input: string, init?: RequestInit) => {
            const response = await backend.fetch(input, init);
            if (!new URL(input).pathname.endsWith('/duplicate')) {
                return response;
            }
            const headers = new Headers(response.headers);
            headers.delete('ETag');
            return new Response(response.body, { status: response.status, headers });
        };
        const report = await runConformance({
            baseUrl: 'http://panneau.test/panneau/api',
            fetch: broken,
            writes,
        });
        expect(report.checks.find((check) => check.id === 'duplicate')).toMatchObject({
            status: 'failed',
            issues: [expect.stringContaining('Expected the ETag of the copy')],
        });
    });
});
