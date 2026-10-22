import type { Problem } from '@panneau/protocol';
import { isProblem } from '@panneau/protocol/runtime';

/**
 * The problem of a failed response: its body when it is one (`application/problem+json`), or a
 * problem built from Laravel's `{ message, errors }` body, or from the status alone. Pass it to
 * `createApiError()` to get the typed error (`ValidationError`, `UnauthorizedError`…) that Panneau
 * forms and the app handle, for an app's own endpoints too.
 *
 * ```ts
 * const response = await fetch('/api/subscriptions', { method: 'POST', body });
 * if (!response.ok) {
 *     throw createApiError(await readProblem(response));
 * }
 * ```
 */
export async function readProblem(response: Response): Promise<Problem> {
    const body: unknown = await response
        .clone()
        .json()
        .catch(() => null);
    if (isProblem(body)) {
        return body;
    }
    const record =
        body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {};
    const problem: Problem = {
        type: 'about:blank',
        title:
            typeof record.title === 'string'
                ? record.title
                : typeof record.message === 'string'
                  ? record.message
                  : response.statusText || `HTTP ${response.status}`,
        status: response.status,
    };
    const errors = record.errors;
    if (errors !== null && typeof errors === 'object' && !Array.isArray(errors)) {
        problem.errors = Object.fromEntries(
            Object.entries(errors).map(([path, messages]) => [
                path,
                (Array.isArray(messages) ? messages : [messages]).map(String),
            ]),
        );
    }
    return problem;
}

/**
 * The seconds to wait that a response gives in `Retry-After`, as seconds or as a date, or `null`.
 * Pass it to `createApiError()` with the problem: a `429` becomes a `RateLimitedError`.
 */
export function readRetryAfter(response: Response): number | null {
    const value = response.headers.get('Retry-After')?.trim();
    if (value === undefined || value === '') {
        return null;
    }
    if (/^\d+$/.test(value)) {
        return Number(value);
    }
    const date = Date.parse(value);
    return Number.isNaN(date) ? null : Math.max(0, Math.ceil((date - Date.now()) / 1000));
}
