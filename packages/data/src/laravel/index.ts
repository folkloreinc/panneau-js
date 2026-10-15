import type { DataAdapter } from '../adapter';
import { UnauthorizedError } from '../errors';
import { type RestAdapterOptions, createRestAdapter } from '../rest';

export interface LaravelAdapterOptions extends RestAdapterOptions {
    /** Name of the cookie that holds the CSRF token. Defaults to Laravel's `XSRF-TOKEN`. */
    xsrfCookie?: string;
    /** Header that sends the CSRF token. Defaults to `X-XSRF-TOKEN`. */
    xsrfHeader?: string;
    /** Reads the cookies. Defaults to `document.cookie`, or no cookies outside a browser. */
    cookies?: () => string;
}

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
        headers: async () => {
            const result = new Headers(typeof headers === 'function' ? await headers() : headers);
            result.set('X-Requested-With', 'XMLHttpRequest');
            const token = readCookie(cookies(), xsrfCookie);
            if (token !== null) {
                result.set(xsrfHeader, token);
            }
            return result;
        },
        createError: (problem, response) =>
            createError?.(problem, response) ??
            (problem.status === 419 ? new UnauthorizedError(problem) : undefined),
    });
}
