import {
    CONTEXT_HEADER,
    type ListQuery,
    PROBLEM_CONTENT_TYPE,
    type Problem,
    formatContextHeader,
    toAggregateParams,
    toSearchParams,
    toSearchQueryParams,
    toWidgetDataParams,
} from '@panneau/protocol';
import type {
    ActionRun,
    Connection,
    ConnectionTokenResponse,
    ContextOption,
    EmbedResponse,
    FieldCheckResponse,
    Item,
    ListResponse,
    Passkey,
    PreviewResponse,
    RecoveryCodes,
    SearchResponse,
    Session,
    TwoFactorSetup,
    TwoFactorStatus,
    User,
    WebAuthnOptions,
} from '@panneau/protocol';

import type { DataAdapter, LoginResult } from './adapter';
import { type ApiError, NetworkError, createApiError } from './errors';
import { readProblem, readRetryAfter } from './problem';
import { createPresignedUploads } from './uploads';

/** The checks of the responses, with the schemas of the protocol, loaded on first use. */
function loadResponseChecks() {
    return import('./responses');
}

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
    /**
     * Sends a `multipart/form-data` request whose method is not `POST` (an update that replaces a
     * file: `PATCH`) as `POST`, with its method in this form field: `'_method'` for Laravel,
     * Symfony or Rails. PHP only parses a multipart body for `POST` (below PHP 8.4 and Symfony
     * 7.4). The headers stay, `If-Match` included, and JSON bodies keep their method. The field
     * replaces a value of the same name at the top of the body. Off by default; the Laravel
     * preset turns it on.
     */
    multipartMethodOverride?: string | false;
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

        let sentMethod = method;
        let payload: BodyInit | undefined;
        if (body !== undefined) {
            if (hasBlob(body)) {
                const data = new FormData();
                appendFormData(data, '', body);
                const override = options.multipartMethodOverride;
                if (
                    override !== undefined &&
                    override !== false &&
                    !['GET', 'HEAD', 'POST'].includes(method.toUpperCase())
                ) {
                    data.set(override, method.toUpperCase());
                    sentMethod = 'POST';
                }
                payload = data;
            } else {
                headers.set('Content-Type', 'application/json');
                payload = JSON.stringify(body);
            }
        }

        const search = query?.toString() ?? '';
        const init: RequestInit = { method: sentMethod, headers };
        if (payload !== undefined) {
            init.body = payload;
        }
        if (options.credentials !== undefined) {
            init.credentials = options.credentials;
        }
        if (signal !== undefined) {
            init.signal = signal;
        }
        let response: Response;
        try {
            response = await fetcher(`${baseUrl}${path}${search !== '' ? `?${search}` : ''}`, init);
        } catch (error) {
            // An aborted request is not a failure of the network.
            if (
                signal?.aborted === true ||
                (error instanceof Error && error.name === 'AbortError')
            ) {
                throw error;
            }
            throw new NetworkError(undefined, { cause: error });
        }
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
            // The schemas load while the request runs
            const [body, { checkDefinition }] = await Promise.all([
                json<unknown>({ path: '/definition', signal }),
                loadResponseChecks(),
            ]);
            return checkDefinition(body);
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

        duplicate(resource, id, { signal } = {}) {
            return data<Item>({
                method: 'POST',
                path: `/resources/${encode(resource)}/${encode(id)}/duplicate`,
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
            const { checkActionResponse } = await loadResponseChecks();
            return checkActionResponse(response.status, body);
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
            return json<LoginResult>({
                method: 'POST',
                path: '/auth/login',
                body: credentials,
                signal,
            });
        },
        async logout({ signal } = {}) {
            await send({ method: 'POST', path: '/auth/logout', signal });
        },
        twoFactorChallenge(answer, { signal } = {}) {
            return json<Session>({
                method: 'POST',
                path: '/auth/two-factor/challenge',
                body: answer,
                signal,
            });
        },
        async confirmPassword(password, { signal } = {}) {
            await send({
                method: 'POST',
                path: '/auth/password/confirm',
                body: { password },
                signal,
            });
        },
        async getAccount({ signal } = {}) {
            return (await json<{ data: User }>({ path: '/account', signal })).data;
        },
        async updateAccount(values, { signal } = {}) {
            return (
                await json<{ data: User }>({
                    method: 'PATCH',
                    path: '/account',
                    body: values,
                    signal,
                })
            ).data;
        },
        async updatePassword(change, { signal } = {}) {
            await send({ method: 'PUT', path: '/account/password', body: change, signal });
        },
        passkeyLoginOptions({ signal } = {}) {
            return json<WebAuthnOptions>({
                method: 'POST',
                path: '/auth/passkeys/options',
                signal,
            });
        },
        passkeyLogin(login, { signal } = {}) {
            return json<Session>({
                method: 'POST',
                path: '/auth/passkeys/login',
                body: login,
                signal,
            });
        },
        async listPasskeys({ signal } = {}) {
            return (await json<{ data: Passkey[] }>({ path: '/account/passkeys', signal })).data;
        },
        passkeyRegistrationOptions({ signal } = {}) {
            return json<WebAuthnOptions>({
                method: 'POST',
                path: '/account/passkeys/options',
                signal,
            });
        },
        async addPasskey(passkey, { signal } = {}) {
            return (
                await json<{ data: Passkey }>({
                    method: 'POST',
                    path: '/account/passkeys',
                    body: passkey,
                    signal,
                })
            ).data;
        },
        async deletePasskey(id, { signal } = {}) {
            await send({ method: 'DELETE', path: `/account/passkeys/${encode(id)}`, signal });
        },
        async listConnections({ signal } = {}) {
            return (await json<{ data: Connection[] }>({ path: '/account/connections', signal }))
                .data;
        },
        createConnectionToken(request, { signal } = {}) {
            return json<ConnectionTokenResponse>({
                method: 'POST',
                path: '/account/connections/tokens',
                body: request,
                signal,
            });
        },
        async revokeConnection(id, { signal } = {}) {
            await send({ method: 'DELETE', path: `/account/connections/${encode(id)}`, signal });
        },
        getTwoFactor({ signal } = {}) {
            return json<TwoFactorStatus>({ path: '/account/two-factor', signal });
        },
        enableTwoFactor({ signal } = {}) {
            return json<TwoFactorSetup>({ method: 'POST', path: '/account/two-factor', signal });
        },
        confirmTwoFactor(code, { signal } = {}) {
            return json<RecoveryCodes>({
                method: 'POST',
                path: '/account/two-factor/confirm',
                body: { code },
                signal,
            });
        },
        async disableTwoFactor({ signal } = {}) {
            await send({ method: 'DELETE', path: '/account/two-factor', signal });
        },
        regenerateRecoveryCodes({ signal } = {}) {
            return json<RecoveryCodes>({
                method: 'POST',
                path: '/account/two-factor/recovery-codes',
                signal,
            });
        },
        async forgotPassword(email, { signal } = {}) {
            await send({ method: 'POST', path: '/auth/password/forgot', body: { email }, signal });
        },
        async resetPassword(reset, { signal } = {}) {
            await send({ method: 'POST', path: '/auth/password/reset', body: reset, signal });
        },
        async sendEmailVerification({ signal } = {}) {
            await send({ method: 'POST', path: '/auth/email/verification', signal });
        },
        async verifyEmail(token, { signal } = {}) {
            await send({ method: 'POST', path: '/auth/email/verify', body: { token }, signal });
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
        getWidgetData(widget, { signal, ...request } = {}) {
            // The home page's widgets are asked for without `page`, as before decision 0084
            const query = toWidgetDataParams(request);
            return json<unknown>({
                path: `/dashboard/widgets/${encode(widget)}`,
                ...(query.toString() !== '' && { query }),
                signal,
            });
        },
        getResourceAggregate(resource, request, { signal } = {}) {
            return json<unknown>({
                path: `/resources/${encode(resource)}/aggregate`,
                query: toAggregateParams(request),
                signal,
            });
        },

        withContext(values) {
            const context = formatContextHeader(values);
            return createRestAdapter({
                ...options,
                headers: async () => {
                    const headers = new Headers(
                        typeof options.headers === 'function'
                            ? await options.headers()
                            : options.headers,
                    );
                    if (context !== '') {
                        headers.set(CONTEXT_HEADER, context);
                    } else {
                        headers.delete(CONTEXT_HEADER);
                    }
                    return headers;
                },
            });
        },
        getContextOptions(name, { q, signal } = {}) {
            return data<ContextOption[]>({
                path: `/context/${encode(name)}/options`,
                query: new URLSearchParams(q !== undefined && q !== '' ? { q } : {}),
                signal,
            });
        },
    };
}
