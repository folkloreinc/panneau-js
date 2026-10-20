import { afterEach, describe, expect, it } from 'vitest';

import { BASE_URL, createStubFetch, jsonResponse } from '../__fixtures__/backend';
import { ApiError, UnauthorizedError, ValidationError } from '../errors';
import { createLaravelAdapter, createLaravelError, getLaravelHeaders } from './index';

afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
});

describe('createLaravelAdapter', () => {
    it('sends the CSRF token from the cookie, with credentials', async () => {
        const { fetch, requests } = createStubFetch(() => jsonResponse(200, { data: [] }));
        const adapter = createLaravelAdapter({ baseUrl: BASE_URL, fetch });

        await adapter.listActionRuns();
        document.cookie = `XSRF-TOKEN=${encodeURIComponent('token=with/chars')}`;
        await adapter.listActionRuns();

        expect(requests.map((request) => request.headers.get('X-XSRF-TOKEN'))).toEqual([
            null,
            'token=with/chars',
        ]);
        expect(requests[1]?.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
        expect(requests[1]?.credentials).toBe('include');
    });

    it('keeps the headers and options of the REST adapter', async () => {
        const { fetch, requests } = createStubFetch(() => jsonResponse(200, { data: [] }));
        const adapter = createLaravelAdapter({
            baseUrl: BASE_URL,
            fetch,
            headers: { 'Accept-Language': 'fr' },
            credentials: 'same-origin',
            xsrfCookie: 'CSRF',
            xsrfHeader: 'X-CSRF',
            cookies: () => 'other=1; CSRF=abc',
        });
        await adapter.listActionRuns();
        expect(requests[0]?.headers.get('Accept-Language')).toBe('fr');
        expect(requests[0]?.headers.get('X-CSRF')).toBe('abc');
        expect(requests[0]?.credentials).toBe('same-origin');
    });

    it('treats 419 as unauthorized', async () => {
        const { fetch } = createStubFetch(() =>
            jsonResponse(419, { message: 'CSRF token mismatch.' }),
        );
        const adapter = createLaravelAdapter({ baseUrl: BASE_URL, fetch });
        const error = await adapter.getSession().catch((caught: unknown) => caught);
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect(error).toMatchObject({ status: 419, message: 'CSRF token mismatch.' });
    });

    it('lets createError take precedence', async () => {
        const { fetch } = createStubFetch(() => jsonResponse(419, {}));
        class ExpiredError extends ApiError {}
        const adapter = createLaravelAdapter({
            baseUrl: BASE_URL,
            fetch,
            createError: (problem) => new ExpiredError(problem),
        });
        await expect(adapter.getSession()).rejects.toBeInstanceOf(ExpiredError);
    });
});

describe('getLaravelHeaders', () => {
    it('adds X-Requested-With and the CSRF token of the cookie to the given headers', () => {
        const headers = getLaravelHeaders({
            headers: { Accept: 'application/json' },
            cookies: () => 'theme=dark; XSRF-TOKEN=abc%3D%3D',
        });
        expect(Object.fromEntries(headers)).toEqual({
            accept: 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'x-xsrf-token': 'abc==',
        });
    });

    it('takes other cookie and header names, and sends no token without the cookie', () => {
        expect(
            getLaravelHeaders({
                cookies: () => 'csrf=1',
                xsrfCookie: 'csrf',
                xsrfHeader: 'X-CSRF',
            }).get('X-CSRF'),
        ).toBe('1');
        expect(getLaravelHeaders({ cookies: () => '' }).has('X-XSRF-TOKEN')).toBe(false);
    });
});

describe('createLaravelError', () => {
    it('treats 419 as unauthorized, and maps other statuses like createApiError', () => {
        const problem = (status: number) => ({ type: 'about:blank', title: 'Error', status });
        expect(createLaravelError(problem(419))).toBeInstanceOf(UnauthorizedError);
        expect(createLaravelError(problem(422))).toBeInstanceOf(ValidationError);
    });
});
