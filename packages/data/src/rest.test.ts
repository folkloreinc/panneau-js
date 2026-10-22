// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { BASE_URL, createBackend, createStubFetch, jsonResponse } from './__fixtures__/backend';
import {
    ApiError,
    ConflictError,
    ForbiddenError,
    InvalidResponseError,
    NotFoundError,
    RateLimitedError,
    UnauthorizedError,
    ValidationError,
} from './errors';
import { createRestAdapter } from './rest';

function setup() {
    const backend = createBackend();
    const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch: backend.fetch });
    return { backend, adapter };
}

describe('createRestAdapter', () => {
    it('loads the definition and applies its defaults', async () => {
        const { adapter } = setup();
        const definition = await adapter.getDefinition();
        expect(definition.name).toBe('Test site');
        expect(definition.resources[0]?.actions?.[0]?.kind).toBe('server');
    });

    it('rejects an invalid definition', async () => {
        const { fetch } = createStubFetch(() => jsonResponse(200, { protocol: 2 }));
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
        const error = await adapter.getDefinition().catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(InvalidResponseError);
        expect((error as InvalidResponseError).issues.map((issue) => issue.path)).toContain(
            'protocol',
        );
    });

    it('lists items with the query string format of the protocol', async () => {
        const { adapter, backend } = setup();
        const page = await adapter.list('pages', {
            filter: { status: ['draft'] },
            sort: ['-title'],
            perPage: 1,
            page: 2,
        });
        expect(page.data.map((item) => item.id)).toEqual(['2']);
        expect(page.meta).toEqual({ page: 2, perPage: 1, total: 2, lastPage: 2 });
        const url = new URL(backend.requests[0]?.url ?? '');
        expect(url.pathname).toBe('/panneau/api/resources/pages');
        expect(url.searchParams.get('sort')).toBe('-title');
        expect(url.searchParams.getAll('filter[status][]')).toEqual(['draft']);
    });

    it('gets, creates, updates and deletes items', async () => {
        const { adapter } = setup();
        expect(await adapter.get('pages', '1')).toMatchObject({ id: '1', version: '1' });

        const created = await adapter.create('pages', {
            title: { en: 'New', fr: 'Nouvelle' },
            status: 'draft',
        });
        expect(created).toMatchObject({ id: '4', version: '1', status: 'draft' });

        const updated = await adapter.update(
            'pages',
            created.id,
            { status: 'published' },
            { version: created.version },
        );
        expect(updated).toMatchObject({ id: '4', version: '2', status: 'published' });

        await adapter.delete('pages', created.id);
        await expect(adapter.get('pages', created.id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('gets the preview URL of an item with unsaved values', async () => {
        const { adapter, backend } = setup();
        const preview = await adapter.previewItem?.('pages', '1', { status: 'published' });
        expect(preview?.url.startsWith('data:text/html')).toBe(true);
        const request = backend.requests.at(-1);
        expect(request?.method).toBe('POST');
        expect(new URL(request?.url ?? '').pathname).toBe('/panneau/api/resources/pages/1/preview');
    });

    it('sends the item version as If-Match', async () => {
        const { adapter, backend } = setup();
        await adapter.update('pages', '1', { status: 'draft' }, { version: '1' });
        await adapter.update('pages', '1', { status: 'draft' });
        await adapter.update('pages', '1', { status: 'draft' }, { version: null });
        expect(backend.requests.map((request) => request.headers.get('If-Match'))).toEqual([
            '"1"',
            null,
            null,
        ]);
        expect(backend.requests[0]?.method).toBe('PATCH');
        expect(backend.requests[0]?.headers.get('Content-Type')).toBe('application/json');
    });

    it('rejects a stale version with a ConflictError that carries the current item', async () => {
        const { adapter } = setup();
        await adapter.update('pages', '1', { status: 'draft' }, { version: '1' });
        const error = await adapter
            .update('pages', '1', { status: 'published' }, { version: '1' })
            .catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(ConflictError);
        expect(error).toBeInstanceOf(ApiError);
        const conflict = error as ConflictError;
        expect(conflict.status).toBe(412);
        expect(conflict.current).toMatchObject({ id: '1', version: '2', status: 'draft' });
        expect(conflict.problem.type).toBe('urn:panneau:problem:version-conflict');
    });

    it('rejects invalid values with a ValidationError keyed by dot paths', async () => {
        const { adapter } = setup();
        const error = await adapter
            .create('pages', { title: { en: 'x'.repeat(41) }, status: 'archived' })
            .catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).errors).toEqual({
            'title.en': ['This value must be at most 40.'],
            'title.fr': ['This field is required.'],
            status: ['This value is not one of the choices.'],
        });
    });

    it('runs actions and returns their result', async () => {
        const { adapter, backend } = setup();
        const response = await adapter.runAction('pages', 'delete', {
            selection: { query: { filter: { status: 'draft' } }, except: ['3'] },
        });
        expect(response.result).toMatchObject({
            summary: { succeeded: 1, failed: 0, skipped: 0 },
            refresh: 'list',
        });
        expect(backend.items('pages').map((item) => item.id)).toEqual(['1', '3']);
        await expect(adapter.runAction('pages', 'unknown', {})).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    it('returns the run of a queued action', async () => {
        const run = {
            id: 'run_1',
            action: 'export',
            resource: 'pages',
            status: 'queued',
            progress: 0,
            total: 3,
        };
        const { fetch } = createStubFetch(() => jsonResponse(202, { run }));
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
        expect(await adapter.runAction('pages', 'export', {})).toEqual({ run });
    });

    it('sends values with files as multipart form data', async () => {
        const { fetch, requests } = createStubFetch(() =>
            jsonResponse(200, { message: 'Imported.' }),
        );
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
        const file = new Blob(['title\nHome'], { type: 'text/csv' });
        await adapter.runAction('pages', 'import', {
            values: { file, columns: ['title'], header: true },
        });
        const body = await requests[0]?.formData();
        expect(requests[0]?.headers.get('Content-Type')).toMatch(/^multipart\/form-data/);
        expect(body?.get('values[file]')).toBeInstanceOf(Blob);
        expect(body?.getAll('values[columns][]')).toEqual(['title']);
        expect(body?.get('values[header]')).toBe('1');
    });

    it.each([
        [401, UnauthorizedError],
        [403, ForbiddenError],
        [404, NotFoundError],
        [409, ApiError],
        [500, ApiError],
    ])('maps a %i problem to its error', async (status, ErrorClass) => {
        const { fetch } = createStubFetch(() =>
            jsonResponse(
                status,
                { type: 'about:blank', title: 'Nope.', detail: 'Details.', status },
                'application/problem+json',
            ),
        );
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
        const error = await adapter.get('pages', '1').catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(ErrorClass);
        expect(error).toMatchObject({ status, message: 'Details.', problem: { title: 'Nope.' } });
    });

    it('builds a problem from responses that are not problems', async () => {
        const responses = [
            jsonResponse(422, { message: 'Invalid.', errors: { title: 'Required.' } }),
            new Response('<h1>Error</h1>', { status: 500, statusText: 'Server Error' }),
        ];
        const { fetch } = createStubFetch(() => responses.shift() ?? jsonResponse(200, {}));
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });

        const validation = await adapter.create('pages', {}).catch((caught: unknown) => caught);
        expect(validation).toBeInstanceOf(ValidationError);
        expect((validation as ValidationError).errors).toEqual({ title: ['Required.'] });
        expect((validation as ValidationError).problem).toMatchObject({
            type: 'about:blank',
            title: 'Invalid.',
            status: 422,
        });

        const server = await adapter.get('pages', '1').catch((caught: unknown) => caught);
        expect(server).toBeInstanceOf(ApiError);
        expect(server).toMatchObject({ status: 500, message: 'Server Error' });
    });

    it('rejects too many requests with a RateLimitedError that says how long to wait', async () => {
        const problem = { type: 'about:blank', title: 'Too many requests.', status: 429 };
        const responses = [
            new Response(JSON.stringify(problem), {
                status: 429,
                headers: { 'Content-Type': 'application/problem+json', 'Retry-After': '12' },
            }),
            jsonResponse(429, problem),
        ];
        const { fetch } = createStubFetch(() => responses.shift() ?? jsonResponse(200, {}));
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });

        const limited = await adapter.search('été').catch((caught: unknown) => caught);
        expect(limited).toBeInstanceOf(RateLimitedError);
        expect(limited).toMatchObject({ status: 429, retryAfter: 12 });
        expect(await adapter.search('été').catch((caught: unknown) => caught)).toMatchObject({
            retryAfter: null,
        });
    });

    it('adds headers and credentials to every request', async () => {
        const { fetch, requests } = createStubFetch(() => jsonResponse(200, { data: [] }));
        let token = 'a';
        const adapter = createRestAdapter({
            baseUrl: `${BASE_URL}/`,
            fetch,
            headers: () => ({ Authorization: `Bearer ${token}` }),
            credentials: 'include',
        });
        await adapter.listActionRuns();
        token = 'b';
        await adapter.listActionRuns();
        expect(requests.map((request) => request.headers.get('Authorization'))).toEqual([
            'Bearer a',
            'Bearer b',
        ]);
        expect(requests[0]?.headers.get('Accept')).toBe(
            'application/json, application/problem+json',
        );
        expect(requests[0]?.credentials).toBe('include');
        expect(new URL(requests[0]?.url ?? '').pathname).toBe('/panneau/api/actions/runs');
    });

    it('lets createError replace the default errors', async () => {
        const { fetch } = createStubFetch(() => jsonResponse(418, {}));
        class TeapotError extends ApiError {}
        const adapter = createRestAdapter({
            baseUrl: BASE_URL,
            fetch,
            createError: (problem) =>
                problem.status === 418 ? new TeapotError(problem) : undefined,
        });
        await expect(adapter.get('pages', '1')).rejects.toBeInstanceOf(TeapotError);
    });

    it('calls the other endpoints of the protocol', async () => {
        const run = { id: 'run/1', action: 'export', resource: 'pages', status: 'running' };
        const { fetch, requests } = createStubFetch((request) => {
            const { pathname } = new URL(request.url);
            if (request.method === 'DELETE' || pathname.endsWith('/logout')) {
                return new Response(null, { status: 204 });
            }
            if (pathname.startsWith('/panneau/api/actions/runs/')) {
                return jsonResponse(200, { run });
            }
            return jsonResponse(200, { user: { id: 'u1', name: 'Ada' }, data: [] });
        });
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });

        expect(await adapter.getActionRun('run/1')).toEqual(run);
        await adapter.cancelActionRun('run/1');
        expect(await adapter.getSession()).toMatchObject({ user: { name: 'Ada' } });
        await adapter.login({ email: 'ada@example.com', password: 'secret' });
        await adapter.logout();
        await adapter.search('été');
        await adapter.search('été', { limit: 20, resources: ['pages', 'articles'] });
        await adapter.getWidgetData('pages-count');

        expect(
            requests.map((request) => {
                const url = new URL(request.url);
                return `${request.method} ${url.pathname}${url.search}`;
            }),
        ).toEqual([
            'GET /panneau/api/actions/runs/run%2F1',
            'DELETE /panneau/api/actions/runs/run%2F1',
            'GET /panneau/api/auth/session',
            'POST /panneau/api/auth/login',
            'POST /panneau/api/auth/logout',
            'GET /panneau/api/search?q=%C3%A9t%C3%A9',
            'GET /panneau/api/search?q=%C3%A9t%C3%A9&limit=20&resources=pages%2Carticles',
            'GET /panneau/api/dashboard/widgets/pages-count',
        ]);
        expect(await requests[3]?.json()).toEqual({
            email: 'ada@example.com',
            password: 'secret',
        });
    });

    it('creates a media from a file uploaded directly to storage', async () => {
        const { fetch, requests } = createStubFetch(() =>
            jsonResponse(201, { data: { id: 'med_1', version: '1', abilities: {} } }),
        );
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
        await adapter.create('media', { file: { upload: 'upl_1' }, name: 'Video' });
        const request = requests[0];
        expect(new URL(request?.url ?? '').pathname).toBe('/panneau/api/resources/media');
        expect(request?.headers.get('Content-Type')).toBe('application/json');
        expect(await request?.json()).toEqual({ file: { upload: 'upl_1' }, name: 'Video' });
    });

    it('signs and completes direct uploads with its headers, cookies and errors', async () => {
        const responses = [
            jsonResponse(200, {
                url: 'https://storage.test/u/upl_1?sig',
                key: 'u/upl_1',
                upload: 'upl_1',
            }),
            jsonResponse(200, { data: { id: 'upl_1', key: 'u/upl_1', name: 'clip.mp4' } }),
            jsonResponse(
                404,
                { title: 'Upload not found.', status: 404 },
                'application/problem+json',
            ),
        ];
        const { fetch, requests } = createStubFetch(
            () => responses.shift() ?? jsonResponse(500, {}),
        );
        const adapter = createRestAdapter({
            baseUrl: BASE_URL,
            fetch,
            headers: { 'X-Test': '1' },
            credentials: 'include',
        });
        const uploads = adapter.presignedUploads?.();

        expect(await uploads?.signRequest({ method: 'POST', key: 'clip.mp4' })).toEqual({
            url: 'https://storage.test/u/upl_1?sig',
            key: 'u/upl_1',
        });
        expect(await uploads?.complete('u/upl_1', { name: 'clip.mp4' })).toMatchObject({
            id: 'upl_1',
        });
        await expect(uploads?.complete('u/upl_2')).rejects.toBeInstanceOf(NotFoundError);

        expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
            '/panneau/api/uploads/sign',
            '/panneau/api/uploads/upl_1/complete',
            '/panneau/api/uploads/upl_2/complete',
        ]);
        expect(requests[0]?.headers.get('X-Test')).toBe('1');
        expect(requests[0]?.credentials).toBe('include');
    });

    it('sends direct uploads to the endpoint of the definition', async () => {
        const { fetch, requests } = createStubFetch(() =>
            jsonResponse(200, { url: 'https://storage.test/x', key: 'x', upload: 'upl_1' }),
        );
        await createRestAdapter({ baseUrl: BASE_URL, fetch })
            .presignedUploads?.({ endpoint: 'https://files.test/uploads' })
            .signRequest({ method: 'PUT', key: 'x' });
        expect(requests[0]?.url).toBe('https://files.test/uploads/sign');
    });
});
