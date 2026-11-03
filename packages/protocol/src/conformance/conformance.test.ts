import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { createMockBackend } from '../mock';
import { formatReport, runConformance } from './index';

function createBackend() {
    const definition = createDefinition();
    // Required to create a page only, like a password.
    definition.resources[0]?.fields.push({
        name: 'code',
        type: 'text',
        rules: [{ rule: 'required', mode: 'create' }],
    });
    // Abilities of the user (decision 0046): a field they can't see, a resource they can't reach.
    definition.resources[0]?.fields.push({
        name: 'notes',
        type: 'textarea',
        abilities: { view: false },
    });
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
    return createMockBackend({
        definition,
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
            'create',
            'update',
            'update.create-rules',
            'update.single-field',
            'update.conflict',
            'duplicate',
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
            'create.invalid',
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
