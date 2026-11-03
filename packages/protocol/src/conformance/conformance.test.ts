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
    // Abilities of the user (decision 0042): a field they can't see, a resource they can't reach.
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
    return createMockBackend({
        definition,
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
