import {
    ActionResult,
    ActionRun,
    Definition,
    type ListQuery,
    PROBLEM_CONTENT_TYPE,
    type Problem,
    toSearchParams,
    toSearchQueryParams,
    validate,
} from '@panneau/protocol';
import type {
    EmbedResponse,
    FieldCheckResponse,
    Item,
    ListResponse,
    PreviewResponse,
    SearchResponse,
    Session,
} from '@panneau/protocol';

import type { ActionResponse, DataAdapter } from './adapter';
import { type ApiError, InvalidResponseError, createApiError } from './errors';
import { readProblem, readRetryAfter } from './problem';
import { createPresignedUploads } from './uploads';

export interface RestAdapterOptions {
    /** URL of the API, as `api.baseUrl` in the definition (`/panneau/api`). */
    baseUrl: string;
    /** The `fetch` function to use. Defaults to the global one. */
    fetch?: (input: string, init: RequestInit) => Promise<Response>;
    /** Headers added to every request, or a function that returns them for each request. */
    headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
    /** Whether requests send cookies (`fetch`'s `credentials`). */
    credentials?: RequestCredentials;
    /**
     * Creates the error of a failed response. Return `undefined` to use the default mapping from
     * the status (`createApiError()`). The Laravel preset uses it for `419`.
     */
    createError?: (problem: Problem, response: Response) => ApiError | undefined;
}

interface Request {
    method?: string;
    path: string;
    query?: URLSearchParams;
    body?: unknown;
    headers?: HeadersInit;
    signal?: AbortSignal | undefined;
}

const ACCEPT = `application/json, ${PROBLEM_CONTENT_TYPE}`;

function isBlob(value: unknown): value is Blob {
    return typeof Blob !== 'undefined' && value instanceof Blob;
}

function hasBlob(value: unknown): boolean {
    if (isBlob(value)) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.some(hasBlob);
    }
    if (value !== null && typeof value === 'object') {
        return Object.values(value).some(hasBlob);
    }
    return false;
}

/** Appends a value to form data with bracket keys: `values[tags][]`, `selection[ids][]`. */
function appendFormData(data: FormData, key: string, value: unknown) {
    if (value === undefined) {
        return;
    }
    if (isBlob(value)) {
        data.append(key, value);
    } else if (Array.isArray(value)) {
        value.forEach((item) => appendFormData(data, `${key}[]`, item));
    } else if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([name, item]) =>
            appendFormData(data, key === '' ? name : `${key}[${name}]`, item),
        );
    } else if (typeof value === 'boolean') {
        data.append(key, value ? '1' : '0');
    } else {
        data.append(key, value === null ? '' : String(value));
    }
}

function encode(path: string): string {
    return encodeURIComponent(path);
}

/**
 * A `DataAdapter` over the HTTP API of the protocol. Errors (`application/problem+json`) reject
 * with typed errors, updates send `If-Match` from the item version, and list queries use the
 * protocol's query string format.
 */
export function createRestAdapter(options: RestAdapterOptions): DataAdapter {
    const baseUrl = options.baseUrl.replace(/\/+$/, '');
    const fetcher = options.fetch ?? ((input, init) => globalThis.fetch(input, init));

    const send = async ({
        method = 'GET',
        path,
        query,
        body,
        headers: requestHeaders,
        signal,
    }: Request): Promise<Response> => {
        const headers = new Headers(
            typeof options.headers === 'function' ? await options.headers() : options.headers,
        );
        headers.set('Accept', ACCEPT);
        new Headers(requestHeaders).forEach((value, name) => headers.set(name, value));

        let payload: BodyInit | undefined;
        if (body !== undefined) {
            if (hasBlob(body)) {
                const data = new FormData();
                appendFormData(data, '', body);
                payload = data;
            } else {
                headers.set('Content-Type', 'application/json');
                payload = JSON.stringify(body);
            }
        }

        const search = query?.toString() ?? '';
        const init: RequestInit = { method, headers };
        if (payload !== undefined) {
            init.body = payload;
        }
        if (options.credentials !== undefined) {
            init.credentials = options.credentials;
        }
        if (signal !== undefined) {
            init.signal = signal;
        }
        const response = await fetcher(
            `${baseUrl}${path}${search !== '' ? `?${search}` : ''}`,
            init,
        );
        if (!response.ok) {
            const problem = await readProblem(response);
            throw (
                options.createError?.(problem, response) ??
                createApiError(problem, { retryAfter: readRetryAfter(response) })
            );
        }
        return response;
    };

    const json = async <T>(request: Request): Promise<T> => {
        const response = await send(request);
        return (await response.json()) as T;
    };

    const data = async <T>(request: Request): Promise<T> => (await json<{ data: T }>(request)).data;

    return {
        async getDefinition({ signal } = {}) {
            const body = await json<unknown>({ path: '/definition', signal });
            const result = validate(Definition, body);
            if (!result.success) {
                throw new InvalidResponseError('The definition is invalid.', result.issues);
            }
            return result.data;
        },

        list(resource, query: ListQuery = {}, { signal } = {}) {
            return json<ListResponse>({
                path: `/resources/${encode(resource)}`,
                query: toSearchParams(query),
                signal,
            });
        },
        get(resource, id, { signal } = {}) {
            return data<Item>({ path: `/resources/${encode(resource)}/${encode(id)}`, signal });
        },
        create(resource, values, { signal } = {}) {
            return data<Item>({
                method: 'POST',
                path: `/resources/${encode(resource)}`,
                body: values,
                signal,
            });
        },
        update(resource, id, values, { version, signal } = {}) {
            return data<Item>({
                method: 'PATCH',
                path: `/resources/${encode(resource)}/${encode(id)}`,
                body: values,
                headers:
                    version !== undefined && version !== null ? { 'If-Match': `"${version}"` } : {},
                signal,
            });
        },
        async delete(resource, id, { signal } = {}) {
            await send({
                method: 'DELETE',
                path: `/resources/${encode(resource)}/${encode(id)}`,
                signal,
            });
        },

        async runAction(resource, action, request, { signal } = {}) {
            const response = await send({
                method: 'POST',
                path: `/resources/${encode(resource)}/actions/${encode(action)}`,
                body: request,
                signal,
            });
            const body: unknown = response.status === 204 ? {} : await response.json();
            if (response.status === 202) {
                const run = validate(ActionRun, (body as { run?: unknown }).run);
                if (!run.success) {
                    throw new InvalidResponseError('The action run is invalid.', run.issues);
                }
                return { run: run.data } satisfies ActionResponse;
            }
            const result = validate(ActionResult, body);
            if (!result.success) {
                throw new InvalidResponseError('The action result is invalid.', result.issues);
            }
            return { result: result.data } satisfies ActionResponse;
        },
        async getActionRun(id, { signal } = {}) {
            return (await json<{ run: ActionRun }>({ path: `/actions/runs/${encode(id)}`, signal }))
                .run;
        },
        listActionRuns({ signal } = {}) {
            return data<ActionRun[]>({ path: '/actions/runs', signal });
        },
        async cancelActionRun(id, { signal } = {}) {
            await send({ method: 'DELETE', path: `/actions/runs/${encode(id)}`, signal });
        },

        presignedUploads({ endpoint } = {}) {
            return createPresignedUploads({
                baseUrl,
                ...(endpoint !== undefined && { endpoint }),
                fetch: fetcher,
                ...(options.headers !== undefined && { headers: options.headers }),
                // The default of `fetch`, as the adapter's other requests
                credentials: options.credentials ?? 'same-origin',
                createError: (problem, response) =>
                    options.createError?.(problem, response) ??
                    createApiError(problem, { retryAfter: readRetryAfter(response) }),
            });
        },
        getSession({ signal } = {}) {
            return json<Session>({ path: '/auth/session', signal });
        },
        login(credentials, { signal } = {}) {
            return json<Session>({
                method: 'POST',
                path: '/auth/login',
                body: credentials,
                signal,
            });
        },
        async logout({ signal } = {}) {
            await send({ method: 'POST', path: '/auth/logout', signal });
        },

        previewItem(resource, id, values, { signal } = {}) {
            return json<PreviewResponse>({
                method: 'POST',
                path: `/resources/${encode(resource)}/${encode(id)}/preview`,
                body: values,
                signal,
            });
        },
        search(q, { signal, limit, resources } = {}) {
            return json<SearchResponse>({
                path: '/search',
                query: toSearchQueryParams({
                    q,
                    ...(limit !== undefined && { limit }),
                    ...(resources !== undefined && { resources }),
                }),
                signal,
            });
        },
        checkField(resource, field, request, { signal } = {}) {
            return json<FieldCheckResponse>({
                method: 'POST',
                path: `/resources/${encode(resource)}/fields/${encode(field)}/check`,
                body: request,
                signal,
            });
        },
        async resolveEmbed(url, { signal } = {}) {
            const response = await json<EmbedResponse>({
                path: '/embeds',
                query: new URLSearchParams({ url }),
                signal,
            });
            return response.data;
        },
        getWidgetData(widget, { signal } = {}) {
            return json<unknown>({ path: `/dashboard/widgets/${encode(widget)}`, signal });
        },
    };
}
