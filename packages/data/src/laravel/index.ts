import type { Problem } from '@panneau/protocol';

import type { DataAdapter } from '../adapter';
import { type ApiError, UnauthorizedError, createApiError } from '../errors';
import { type RestAdapterOptions, createRestAdapter } from '../rest';

/** How to send Laravel's CSRF token. */
export interface LaravelSessionOptions {
    /** Name of the cookie that holds the CSRF token. Defaults to Laravel's `XSRF-TOKEN`. */
    xsrfCookie?: string;
    /** Header that sends the CSRF token. Defaults to `X-XSRF-TOKEN`. */
    xsrfHeader?: string;
    /** Reads the cookies. Defaults to `document.cookie`, or no cookies outside a browser. */
    cookies?: () => string;
}

export interface LaravelAdapterOptions extends RestAdapterOptions, LaravelSessionOptions {}

function readCookie(cookies: string, name: string): string | null {
    for (const part of cookies.split(';')) {
        const [key, ...value] = part.trim().split('=');
        if (key === name) {
            try {
                return decodeURIComponent(value.join('='));
            } catch {
                return value.join('=');
            }
        }
    }
    return null;
}

/**
 * The headers of a request to a Laravel app with session authentication: `X-Requested-With`, so
 * that Laravel answers errors as JSON, and the CSRF token from the `XSRF-TOKEN` cookie. Use them,
 * with `credentials: 'include'`, for an app's own endpoints next to Panneau's.
 *
 * ```ts
 * fetch('/api/subscriptions', {
 *     method: 'POST',
 *     credentials: 'include',
 *     headers: getLaravelHeaders({ headers: { 'Content-Type': 'application/json' } }),
 *     body: JSON.stringify(values),
 * });
 * ```
 */
export function getLaravelHeaders({
    headers,
    xsrfCookie = 'XSRF-TOKEN',
    xsrfHeader = 'X-XSRF-TOKEN',
    cookies = () => (typeof document === 'undefined' ? '' : document.cookie),
}: LaravelSessionOptions & { headers?: HeadersInit } = {}): Headers {
    const result = new Headers(headers);
    result.set('X-Requested-With', 'XMLHttpRequest');
    const token = readCookie(cookies(), xsrfCookie);
    if (token !== null) {
        result.set(xsrfHeader, token);
    }
    return result;
}

/**
 * The typed error of a failed response of a Laravel app: `createApiError()`, with `419` (an
 * expired CSRF token or session) as `UnauthorizedError`, like `401`.
 *
 * ```ts
 * if (!response.ok) {
 *     throw createLaravelError(await readProblem(response));
 * }
 * ```
 */
export function createLaravelError(problem: Problem): ApiError {
    return problem.status === 419 ? new UnauthorizedError(problem) : createApiError(problem);
}

/**
 * The REST adapter set up for `laravel-panneau` with Laravel's session authentication: it sends
 * cookies, adds the CSRF token from the `XSRF-TOKEN` cookie to every request, and treats `419`
 * (expired CSRF token or session) as unauthorized.
 */
export function createLaravelAdapter({
    xsrfCookie = 'XSRF-TOKEN',
    xsrfHeader = 'X-XSRF-TOKEN',
    cookies = () => (typeof document === 'undefined' ? '' : document.cookie),
    headers,
    credentials = 'include',
    createError,
    ...options
}: LaravelAdapterOptions): DataAdapter {
    return createRestAdapter({
        ...options,
        credentials,
        headers: async () =>
            getLaravelHeaders({
                headers: typeof headers === 'function' ? await headers() : headers,
                xsrfCookie,
                xsrfHeader,
                cookies,
            }),
        createError: (problem, response) =>
            createError?.(problem, response) ??
            (problem.status === 419 ? createLaravelError(problem) : undefined),
    });
}
