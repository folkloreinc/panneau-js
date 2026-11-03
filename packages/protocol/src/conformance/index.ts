import { z } from 'zod';

import { CONTEXT_HEADER, CONTEXT_PROBLEM_TYPE } from '../constants';
import { formatContextHeader } from '../context';
import { type FilterRange, isCursorPage, toSearchParams } from '../query';
import { Definition, type Resource, User } from '../schemas';
import {
    ActionResult,
    ContextOptionsResponse,
    FieldCheckResponse,
    type Item,
    ItemResponse,
    ListResponse,
    Problem,
    SearchResponse,
    TwoFactorStatus,
    UploadSignResponse,
} from '../schemas/api';
import {
    SEARCH_DEFAULT_LIMIT,
    SEARCH_MAX_LIMIT,
    type SearchQuery,
    isSearchableResource,
    toSearchQueryParams,
} from '../search';
import { isEqual, isFilled } from '../values';
import { PROBLEM_CONTENT_TYPE } from '../version';

export interface ConformanceOptions {
    /** Base URL of the API, the same as `api.baseUrl` of the definition, but absolute. */
    baseUrl: string;
    /** The `fetch` to use. Defaults to the global one. */
    fetch?: (input: string, init?: RequestInit) => Promise<Response>;
    /** Merged into every request, for authentication headers or cookies. */
    init?: RequestInit;
    /** Resource to test. Defaults to the first resource of the definition. */
    resource?: string;
    /**
     * Values of the context (decision 0045), sent in `Panneau-Context` with every request: for a
     * backend whose resources need a value of a required param. The checks of the context use
     * them too, and the first choice of each param without one.
     */
    context?: Record<string, string>;
    /**
     * Enables the checks that write data, on the tested resource. Use a test database: these
     * checks create, update and delete an item.
     */
    writes?: {
        /** Valid values for a new item. */
        create: Record<string, unknown>;
        /** Valid values for an update. */
        update: Record<string, unknown>;
        /** Values that must be refused with a `422`. Defaults to `{}` when a field is required. */
        invalid?: Record<string, unknown>;
    };
}

export type ConformanceStatus = 'passed' | 'failed' | 'skipped';

export interface ConformanceCheck {
    id: string;
    title: string;
    status: ConformanceStatus;
    /** What went wrong, or why the check was skipped. */
    issues: string[];
}

export interface ConformanceReport {
    passed: boolean;
    checks: ConformanceCheck[];
}

interface Reply {
    status: number;
    contentType: string;
    etag: string | null;
    body: unknown;
}

const UNKNOWN = '__panneau_conformance_unknown__';

const AccountResponse = z.looseObject({ data: User });

function describeIssues(error: z.ZodError): string[] {
    return error.issues.slice(0, 10).map((issue) => {
        const path = issue.path.map(String).join('.');
        return path === '' ? issue.message : `${path}: ${issue.message}`;
    });
}

/** The first text of a value: a string, or the first string of a localized value. */
function textOf(value: unknown): string | null {
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        for (const entry of Object.values(value)) {
            if (typeof entry === 'string' && entry.trim() !== '') {
                return entry;
            }
        }
    }
    return null;
}

function normalizeEtag(value: string): string {
    return value.replace(/^W\//, '');
}

class Check {
    issues: string[] = [];
    skippedBecause: string | null = null;

    expect(condition: boolean, issue: string): boolean {
        if (!condition) {
            this.issues.push(issue);
        }
        return condition;
    }

    expectStatus(reply: Reply, status: number): boolean {
        return this.expect(
            reply.status === status,
            `Expected status ${status}, got ${reply.status}.`,
        );
    }

    expectSchema<T extends z.ZodType>(schema: T, value: unknown, label: string): z.infer<T> | null {
        const result = schema.safeParse(value);
        if (result.success) {
            return result.data;
        }
        this.issues.push(
            `${label} does not match the schema:`,
            ...describeIssues(result.error).map((issue) => `  ${issue}`),
        );
        return null;
    }

    expectProblem(reply: Reply, status: number): Problem | null {
        if (!this.expectStatus(reply, status)) {
            return null;
        }
        this.expect(
            reply.contentType.startsWith(PROBLEM_CONTENT_TYPE),
            `Expected content type ${PROBLEM_CONTENT_TYPE}, got "${reply.contentType}".`,
        );
        return this.expectSchema(Problem, reply.body, 'The error');
    }

    skip(reason: string) {
        this.skippedBecause = reason;
    }
}

/**
 * Runs the protocol's conformance checks against a live backend. Read-only checks always run;
 * checks that write data run only with `writes`.
 */
export async function runConformance(options: ConformanceOptions): Promise<ConformanceReport> {
    const fetcher = options.fetch ?? ((input: string, init?: RequestInit) => fetch(input, init));
    const baseUrl = options.baseUrl.replace(/\/$/, '');
    const checks: ConformanceCheck[] = [];

    const request = async (path: string, init: RequestInit = {}): Promise<Reply> => {
        const headers = new Headers(options.init?.headers);
        headers.set('Accept', 'application/json');
        if (options.context !== undefined && Object.keys(options.context).length > 0) {
            headers.set(CONTEXT_HEADER, formatContextHeader(options.context));
        }
        new Headers(init.headers).forEach((value, key) => headers.set(key, value));
        if (init.body !== undefined) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetcher(`${baseUrl}${path}`, { ...options.init, ...init, headers });
        const text = await response.text();
        const parse = (): unknown => {
            if (text === '') {
                return null;
            }
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        };
        const body = parse();
        return {
            status: response.status,
            contentType: response.headers.get('Content-Type') ?? '',
            etag: response.headers.get('ETag'),
            body,
        };
    };

    const run = async (id: string, title: string, body: (check: Check) => Promise<void>) => {
        const check = new Check();
        try {
            await body(check);
        } catch (error) {
            check.issues.push(
                `Request failed: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
        const status: ConformanceStatus =
            check.issues.length > 0
                ? 'failed'
                : check.skippedBecause !== null
                  ? 'skipped'
                  : 'passed';
        checks.push({
            id,
            title,
            status,
            issues:
                status === 'skipped' && check.skippedBecause !== null
                    ? [check.skippedBecause]
                    : check.issues,
        });
    };

    let definition: Definition | null = null;
    let resource: Resource | null = null;
    let firstItemId: string | null = null;

    await run('definition', 'GET /definition returns a valid definition', async (check) => {
        const reply = await request('/definition');
        if (check.expectStatus(reply, 200)) {
            definition = check.expectSchema(Definition, reply.body, 'The definition');
        }
    });

    await run('definition.resource', 'The definition has the resource to test', async (check) => {
        const current = definition as Definition | null;
        if (current === null) {
            check.skip('No valid definition.');
            return;
        }
        resource =
            (options.resource !== undefined
                ? current.resources.find((candidate) => candidate.id === options.resource)
                : current.resources[0]) ?? null;
        check.expect(
            resource !== null,
            options.resource !== undefined
                ? `The definition has no resource "${options.resource}".`
                : 'The definition has no resources.',
        );
    });

    // The context (decision 0045): the choices of its params, a definition built for a value,
    // and a value that doesn't exist refused with a 403.
    const contextParams = () => (definition as Definition | null)?.context?.params ?? [];
    let contextValue: { name: string; value: string } | null = null;

    await run(
        'context.options',
        'GET /context/{param}/options gives the choices of the params of the context',
        async (check) => {
            const params = contextParams();
            if (params.length === 0) {
                check.skip('The definition has no context.');
                return;
            }
            const values: Record<string, string> = {};
            for (const param of params) {
                // The backend sets it from the request: there is nothing to pick
                if (param.fixed === true) {
                    continue;
                }
                let first = param.options?.[0]?.value;
                if (param.options === undefined) {
                    const reply = await request(
                        `/context/${encodeURIComponent(param.name)}/options`,
                        { headers: { [CONTEXT_HEADER]: formatContextHeader(values) } },
                    );
                    if (!check.expectStatus(reply, 200)) {
                        return;
                    }
                    const choices = check.expectSchema(
                        ContextOptionsResponse,
                        reply.body,
                        `The choices of "${param.name}"`,
                    );
                    first = choices?.data[0]?.value;
                }
                const value = options.context?.[param.name] ?? first;
                if (value === undefined) {
                    return;
                }
                values[param.name] = value;
                contextValue ??= { name: param.name, value };
            }
        },
    );

    await run(
        'context.value',
        'GET /definition is built for the values of Panneau-Context',
        async (check) => {
            const chosen = contextValue as { name: string; value: string } | null;
            if (chosen === null) {
                check.skip(
                    contextParams().length === 0
                        ? 'The definition has no context.'
                        : 'No choice of the first param to send.',
                );
                return;
            }
            const reply = await request('/definition', {
                headers: { [CONTEXT_HEADER]: formatContextHeader({ [chosen.name]: chosen.value }) },
            });
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const built = check.expectSchema(Definition, reply.body, 'The definition');
            const param = built?.context?.params.find(({ name }) => name === chosen.name);
            check.expect(
                param?.value === chosen.value,
                `The definition was built for ${chosen.name}=${String(param?.value ?? null)}, expected ${chosen.value}.`,
            );
        },
    );

    await run(
        'context.refused',
        'A value of the context that does not exist is a 403 context problem',
        async (check) => {
            const param = contextParams()[0];
            if (param === undefined) {
                check.skip('The definition has no context.');
                return;
            }
            const reply = await request('/definition', {
                headers: { [CONTEXT_HEADER]: formatContextHeader({ [param.name]: UNKNOWN }) },
            });
            const problem = check.expectProblem(reply, 403);
            if (problem !== null) {
                check.expect(
                    problem.type === CONTEXT_PROBLEM_TYPE,
                    `Expected the type ${CONTEXT_PROBLEM_TYPE}, got ${problem.type}.`,
                );
                check.expect(
                    problem.param === param.name,
                    `Expected the param "${param.name}", got ${String(problem.param ?? 'none')}.`,
                );
            }
        },
    );

    // Password reset and email verification (decision 0048), with addresses and tokens that don't
    // exist: no email is sent.
    const auth = () => (definition as Definition | null)?.auth;
    const NOBODY = 'nobody@conformance.invalid';

    await run(
        'auth.password-forgot',
        'POST /auth/password/forgot answers the same for an unknown address, and refuses an invalid one',
        async (check) => {
            if (auth()?.passwordReset !== true) {
                check.skip('The definition has no `auth.passwordReset`.');
                return;
            }
            check.expectStatus(
                await request('/auth/password/forgot', {
                    method: 'POST',
                    body: JSON.stringify({ email: NOBODY }),
                }),
                204,
            );
            const invalid = check.expectProblem(
                await request('/auth/password/forgot', { method: 'POST', body: '{}' }),
                422,
            );
            if (invalid !== null) {
                check.expect(
                    (invalid.errors?.email?.length ?? 0) > 0,
                    'Expected a message in `errors.email`.',
                );
            }
        },
    );

    await run(
        'auth.password-reset',
        'POST /auth/password/reset refuses a token that does not exist',
        async (check) => {
            if (auth()?.passwordReset !== true) {
                check.skip('The definition has no `auth.passwordReset`.');
                return;
            }
            check.expectProblem(
                await request('/auth/password/reset', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: UNKNOWN,
                        email: NOBODY,
                        password: 'Conformance-Password-1',
                    }),
                }),
                422,
            );
        },
    );

    await run(
        'auth.email-verify',
        'POST /auth/email/verify refuses a token that does not exist',
        async (check) => {
            if (auth()?.emailVerification !== true) {
                check.skip('The definition has no `auth.emailVerification`.');
                return;
            }
            const invalid = check.expectProblem(
                await request('/auth/email/verify', {
                    method: 'POST',
                    body: JSON.stringify({ token: UNKNOWN }),
                }),
                422,
            );
            if (invalid !== null) {
                check.expect(
                    (invalid.errors?.token?.length ?? 0) > 0,
                    'Expected a message in `errors.token`.',
                );
            }
        },
    );

    // The account page (decision 0050): the current user, without changing it.
    await run('account', 'GET /account gives the current user', async (check) => {
        if (auth()?.account !== true) {
            check.skip('The definition has no `auth.account`.');
            return;
        }
        const reply = await request('/account');
        if (check.expectStatus(reply, 200)) {
            check.expectSchema(AccountResponse, reply.body, 'The account');
        }
    });

    // Two-factor authentication (decision 0049): the status of the user, and a challenge without a
    // login that waits for it. Nothing about the user changes.
    await run(
        'account.two-factor',
        'GET /account/two-factor gives the two-factor authentication of the user',
        async (check) => {
            if (auth()?.twoFactor !== true) {
                check.skip('The definition has no `auth.twoFactor`.');
                return;
            }
            const reply = await request('/account/two-factor');
            if (check.expectStatus(reply, 200)) {
                check.expectSchema(TwoFactorStatus, reply.body, 'The status');
            }
        },
    );

    await run(
        'auth.two-factor-challenge',
        'POST /auth/two-factor/challenge refuses a code without a login that waits for it',
        async (check) => {
            if (auth()?.twoFactor !== true) {
                check.skip('The definition has no `auth.twoFactor`.');
                return;
            }
            check.expectProblem(
                await request('/auth/two-factor/challenge', {
                    method: 'POST',
                    body: JSON.stringify({ code: '000000' }),
                }),
                422,
            );
        },
    );

    const resourcePath = () =>
        `/resources/${encodeURIComponent((resource as Resource | null)?.id ?? '')}`;

    await run('list', 'GET /resources/{resource} returns a page of items', async (check) => {
        if (resource === null) {
            check.skip('No resource to test.');
            return;
        }
        // A list paged with cursors has no page numbers (decision 0039).
        const cursors = (resource as Resource).list?.pagination === 'cursor';
        const reply = await request(`${resourcePath()}?${cursors ? '' : 'page=1&'}perPage=2`);
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const list = check.expectSchema(ListResponse, reply.body, 'The list');
        if (list === null) {
            return;
        }
        check.expect(list.data.length <= 2, `perPage=2 returned ${list.data.length} items.`);
        check.expect(list.meta.perPage === 2, `meta.perPage is ${list.meta.perPage}, expected 2.`);
        firstItemId = list.data[0]?.id ?? null;
        const { meta } = list;
        if (!cursors) {
            check.expect(
                !isCursorPage(meta) && meta.page === 1,
                `meta.page is ${String((meta as { page?: unknown }).page)}, expected 1.`,
            );
            return;
        }
        if (!isCursorPage(meta)) {
            check.expect(false, 'The list pages with cursors, but its meta has no nextCursor.');
            return;
        }
        // The next page follows on from the first, and a cursor the backend can't read is a 422.
        if (meta.nextCursor !== null) {
            const next = await request(
                `${resourcePath()}?${toSearchParams({ perPage: 2, cursor: meta.nextCursor })}`,
            );
            if (check.expectStatus(next, 200)) {
                const page = check.expectSchema(ListResponse, next.body, 'The next page');
                const repeated = (page?.data ?? []).filter((item) =>
                    list.data.some((first) => first.id === item.id),
                );
                check.expect(
                    repeated.length === 0,
                    `The page of nextCursor repeats items of the first page: ${repeated.map((item) => item.id).join(', ')}.`,
                );
            }
        }
        const invalid = await request(
            `${resourcePath()}?${toSearchParams({ perPage: 2, cursor: 'panneau-conformance-invalid' })}`,
        );
        const problem = check.expectProblem(invalid, 422);
        check.expect(
            problem === null || (problem.errors?.cursor ?? []).length > 0,
            'An invalid cursor answers a 422 without errors.cursor.',
        );
    });

    await run('list.sort', 'GET /resources/{resource} accepts a sort', async (check) => {
        const sort = (resource as Resource | null)?.list?.sorts?.[0];
        if (sort === undefined) {
            check.skip('The resource declares no sorts.');
            return;
        }
        const reply = await request(`${resourcePath()}?sort=${encodeURIComponent(`-${sort}`)}`);
        if (check.expectStatus(reply, 200)) {
            check.expectSchema(ListResponse, reply.body, 'The sorted list');
        }
    });

    await run(
        'list.filter-range',
        'GET /resources/{resource} reads the bounds of a range filter',
        async (check) => {
            const filter = (resource as Resource | null)?.list?.filters?.find(
                (candidate) => candidate.type === 'date-range',
            );
            if (filter === undefined) {
                check.skip('The resource declares no date-range filter.');
                return;
            }
            const list = async (range: FilterRange | null, label: string) => {
                const query =
                    range !== null ? `?${toSearchParams({ filter: { [filter.id]: range } })}` : '';
                const reply = await request(`${resourcePath()}${query}`);
                if (!check.expectStatus(reply, 200)) {
                    return null;
                }
                return check.expectSchema(ListResponse, reply.body, label);
            };
            const all = await list(null, 'The list');
            if (all === null) {
                return;
            }
            // Items of the first page with a value: a range that covers every day includes them.
            const dated = all.data.filter((item) => isFilled(item[filter.id])).length;
            const ranges: [FilterRange, string][] = [
                [{ from: '0001-01-01', to: '9999-12-31' }, 'from 0001-01-01 to 9999-12-31'],
                [{ to: '9999-12-31' }, 'up to 9999-12-31 (an open start)'],
            ];
            // A list paged with cursors may have no total: the first page then counts.
            const totalOf = (reply: ListResponse) =>
                typeof reply.meta.total === 'number' ? reply.meta.total : null;
            for (const [range, label] of ranges) {
                const reply = await list(range, `The list filtered ${label}`);
                const total = reply !== null ? totalOf(reply) : null;
                if (total !== null) {
                    check.expect(
                        total >= dated,
                        `Filtered ${label}, the list has ${total} items; the first page alone has ${dated} with a ${filter.id}.`,
                    );
                }
            }
            const future = await list({ from: '9999-12-31' }, 'The list filtered from 9999-12-31');
            if (future !== null) {
                const total = totalOf(future) ?? future.data.length;
                check.expect(
                    total === 0,
                    `Filtered from 9999-12-31, the list has ${total} items, expected 0.`,
                );
            }
        },
    );

    await run(
        'action.dry-run',
        'A dry run of an action counts what it would do, and changes nothing',
        async (check) => {
            const action = (resource as Resource | null)?.actions?.find(
                (candidate) =>
                    candidate.dryRun === true &&
                    candidate.kind === 'server' &&
                    candidate.scope.includes('selection'),
            );
            if (action === undefined) {
                check.skip('The resource declares no selection action with dryRun.');
                return;
            }
            const page = async (label: string) => {
                const reply = await request(`${resourcePath()}?page=1&perPage=20`);
                return check.expectStatus(reply, 200)
                    ? check.expectSchema(ListResponse, reply.body, label)
                    : null;
            };
            const before = await page('The list before the dry run');
            const reply = await request(
                `${resourcePath()}/actions/${encodeURIComponent(action.id)}`,
                {
                    method: 'POST',
                    body: JSON.stringify({ selection: { query: {} }, dryRun: true }),
                },
            );
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const result = check.expectSchema(ActionResult, reply.body, 'The dry run result');
            if (result !== null && before !== null) {
                check.expect(
                    result.summary !== undefined,
                    'A dry run result must have a summary of the items that would succeed and be skipped.',
                );
                if (result.summary !== undefined) {
                    const counted =
                        result.summary.succeeded + result.summary.failed + result.summary.skipped;
                    check.expect(
                        counted === before.meta.total,
                        `The dry run counts ${counted} items; the list has ${before.meta.total}.`,
                    );
                }
            }
            const after = await page('The list after the dry run');
            if (before !== null && after !== null) {
                const versions = (list: typeof before) =>
                    JSON.stringify(list.data.map((item) => [item.id, item.version ?? null]));
                check.expect(
                    after.meta.total === before.meta.total && versions(after) === versions(before),
                    'A dry run must not change the items.',
                );
            }
        },
    );

    await run(
        'action.delete',
        'The built-in `delete` answers, with dry runs, without being declared',
        async (check) => {
            const current = resource as Resource | null;
            if (current === null) {
                check.skip('No resource to test.');
                return;
            }
            if (current.itemActions !== undefined && !current.itemActions.includes('delete')) {
                check.skip('The resource leaves out `delete` (`itemActions`).');
                return;
            }
            if (firstItemId === null) {
                check.skip('The list has no items.');
                return;
            }
            // A dry run changes nothing: the check runs without `writes`.
            const reply = await request(`${resourcePath()}/actions/delete`, {
                method: 'POST',
                body: JSON.stringify({ selection: { ids: [firstItemId] }, dryRun: true }),
            });
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const result = check.expectSchema(ActionResult, reply.body, 'The dry run of `delete`');
            if (result !== null) {
                check.expect(
                    result.summary !== undefined &&
                        result.summary.succeeded +
                            result.summary.skipped +
                            result.summary.failed ===
                            1,
                    'The dry run of `delete` on one item must count it, as deleted or skipped.',
                );
            }
            check.expectStatus(
                await request(`${resourcePath()}/${encodeURIComponent(firstItemId)}`),
                200,
            );
        },
    );

    await run(
        'uploads.sign',
        'POST /uploads/sign signs the first request of a file, and only the keys of open uploads',
        async (check) => {
            const uploads = (definition as Definition | null)?.uploads;
            if (uploads?.mode !== 'presigned') {
                check.skip('The definition has no presigned uploads.');
                return;
            }
            if (uploads.endpoint !== undefined) {
                check.skip('The upload routes are not at {api.baseUrl}/uploads.');
                return;
            }
            const sign = (body: unknown) =>
                request('/uploads/sign', { method: 'POST', body: JSON.stringify(body) });
            const reply = await sign({ method: 'POST', key: 'panneau-conformance.txt' });
            if (check.expectStatus(reply, 200)) {
                const signed = check.expectSchema(
                    UploadSignResponse,
                    reply.body,
                    'The signed request',
                );
                if (signed !== null) {
                    check.expect(
                        signed.key !== undefined && signed.upload !== undefined,
                        'The first request of a file must answer the key and the upload the backend chose.',
                    );
                }
            }
            check.expectProblem(
                await sign({
                    method: 'PUT',
                    key: 'not-an-upload-of-this-user',
                    uploadId: 'unknown',
                    partNumber: 1,
                }),
                404,
            );
            check.expectProblem(
                await request(`/uploads/${UNKNOWN}/complete`, { method: 'POST' }),
                404,
            );
        },
    );

    await run(
        'fields.check',
        'POST /resources/{resource}/fields/{field}/check checks a value of a field with `check`',
        async (check) => {
            const field = resource?.fields.find((candidate) => candidate.check === true);
            if (resource === null || field === undefined) {
                check.skip('The resource has no field with `check`.');
                return;
            }
            const checkPath = (name: string) =>
                `${resourcePath()}/fields/${encodeURIComponent(name)}/check`;
            const locale = field.localized === true ? definition?.locale : undefined;
            const reply = await request(checkPath(field.name), {
                method: 'POST',
                body: JSON.stringify({
                    value: 'panneau-conformance',
                    ...(locale !== undefined ? { locale } : {}),
                    id: null,
                    values: {},
                }),
            });
            if (check.expectStatus(reply, 200)) {
                check.expectSchema(FieldCheckResponse, reply.body, 'The check');
            }
            check.expectProblem(
                await request(checkPath(UNKNOWN), { method: 'POST', body: '{"value":"x"}' }),
                404,
            );
        },
    );

    await run('list.unknown-resource', 'An unknown resource is a 404 problem', async (check) => {
        check.expectProblem(await request(`/resources/${UNKNOWN}`), 404);
    });

    await run(
        'item',
        'GET /resources/{resource}/{id} returns the item with its ETag',
        async (check) => {
            if (firstItemId === null) {
                check.skip('The list has no items.');
                return;
            }
            const reply = await request(`${resourcePath()}/${encodeURIComponent(firstItemId)}`);
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const item = check.expectSchema(ItemResponse, reply.body, 'The item');
            if (item === null) {
                return;
            }
            check.expect(
                item.data.id === firstItemId,
                `Asked for item "${firstItemId}", got "${item.data.id}".`,
            );
            if (item.data.version !== null) {
                check.expect(
                    reply.etag !== null && normalizeEtag(reply.etag) === `"${item.data.version}"`,
                    `Expected ETag "${item.data.version}" (quoted), got ${reply.etag ?? 'none'}.`,
                );
            }
        },
    );

    await run('item.missing', 'A missing item is a 404 problem', async (check) => {
        if (resource === null) {
            check.skip('No resource to test.');
            return;
        }
        check.expectProblem(await request(`${resourcePath()}/${UNKNOWN}`), 404);
    });

    // The API agrees with the abilities of the definition and of the items (decision 0046).
    const listItems = async (check: Check): Promise<Item[] | null> => {
        const cursors = (resource as Resource | null)?.list?.pagination === 'cursor';
        const reply = await request(`${resourcePath()}?${cursors ? '' : 'page=1&'}perPage=20`);
        if (!check.expectStatus(reply, 200)) {
            return null;
        }
        return check.expectSchema(ListResponse, reply.body, 'The list')?.data ?? null;
    };

    await run(
        'abilities.view-any',
        'The resources the user can’t list answer 403 on their list',
        async (check) => {
            const current = definition as Definition | null;
            const denied = (current?.resources ?? []).filter(
                (candidate) => candidate.abilities?.viewAny === false,
            );
            if (denied.length === 0) {
                check.skip('Every resource can be listed.');
                return;
            }
            for (const candidate of denied) {
                const reply = await request(`/resources/${encodeURIComponent(candidate.id)}`);
                check.expect(
                    reply.status === 403,
                    `${candidate.id} has \`viewAny: false\`, but its list answered ${reply.status}.`,
                );
            }
        },
    );

    await run(
        'abilities.fields',
        'Items leave out the values of the fields the user can’t see',
        async (check) => {
            const hidden = ((resource as Resource | null)?.fields ?? [])
                .filter((field) => field.abilities?.view === false)
                .map((field) => field.name);
            if (hidden.length === 0) {
                check.skip('The resource has no field with `view: false`.');
                return;
            }
            const items = await listItems(check);
            if (items === null) {
                return;
            }
            if (items.length === 0) {
                check.skip('The list has no items.');
                return;
            }
            items.forEach((item) => {
                const shown = hidden.filter((name) => name in item);
                check.expect(
                    shown.length === 0,
                    `Item ${item.id} has values of fields with \`view: false\`: ${shown.join(', ')}.`,
                );
            });
        },
    );

    await run(
        'abilities.delete',
        'An item that can’t be deleted is skipped by a dry run of `delete`',
        async (check) => {
            const current = resource as Resource | null;
            if (current === null) {
                check.skip('No resource to test.');
                return;
            }
            if (current.itemActions !== undefined && !current.itemActions.includes('delete')) {
                check.skip('The resource leaves out `delete` (`itemActions`).');
                return;
            }
            const items = await listItems(check);
            const denied = items?.find((item) => item.abilities.delete !== true);
            if (items === null) {
                return;
            }
            if (denied === undefined) {
                check.skip('Every item of the first page can be deleted.');
                return;
            }
            // With an item it can delete too: the only item of an action would be a 403 instead
            const allowed = items.find((item) => item.abilities.delete === true);
            const ids = allowed !== undefined ? [denied.id, allowed.id] : [denied.id];
            const reply = await request(`${resourcePath()}/actions/delete`, {
                method: 'POST',
                body: JSON.stringify({ selection: { ids }, dryRun: true }),
            });
            if (allowed === undefined && reply.status === 403) {
                return;
            }
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const result = check.expectSchema(ActionResult, reply.body, 'The dry run of `delete`');
            check.expect(
                result === null ||
                    (result.summary?.skipped === 1 && result.summary.succeeded === ids.length - 1),
                `Item ${denied.id} can’t be deleted, but the dry run of \`delete\` doesn’t skip it.`,
            );
        },
    );

    // The global search: a word of the title of an item of a searchable resource finds it.
    let searched: { resource: Resource; term: string } | null = null;
    const searchSkip = (): string | null => {
        const current = definition as Definition | null;
        if (current === null) {
            return 'No valid definition.';
        }
        if (current.search?.enabled === false) {
            return 'The definition disables the global search.';
        }
        return searched === null
            ? 'No searchable resource has an item with a title to search for.'
            : null;
    };
    const search = (query: SearchQuery) => request(`/search?${toSearchQueryParams(query)}`);

    await run('search', 'GET /search finds items of the searchable resources', async (check) => {
        const current = definition as Definition | null;
        const tested = resource as Resource | null;
        if (current === null || current.search?.enabled === false) {
            check.skip(searchSkip() ?? '');
            return;
        }
        const candidates = current.resources
            .filter(
                (candidate) =>
                    isSearchableResource(candidate) && candidate.abilities?.viewAny !== false,
            )
            // The tested resource first
            .sort((a, b) => Number(b.id === tested?.id) - Number(a.id === tested?.id));
        for (const candidate of candidates) {
            if (candidate.itemTitle === undefined || searched !== null) {
                continue;
            }
            const reply = await request(
                `/resources/${encodeURIComponent(candidate.id)}?page=1&perPage=1`,
            );
            const list = ListResponse.safeParse(reply.body);
            const title = list.success ? textOf(list.data.data[0]?.[candidate.itemTitle]) : null;
            const term = title?.split(/\s+/).find((word) => word.length >= 2);
            if (term !== undefined) {
                searched = { resource: candidate, term };
            }
        }
        const reason = searchSkip();
        if (reason !== null || searched === null) {
            check.skip(reason ?? '');
            return;
        }
        const { resource: target, term } = searched as { resource: Resource; term: string };
        const reply = await search({ q: term });
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const results = check.expectSchema(SearchResponse, reply.body, 'The results');
        if (results === null) {
            return;
        }
        const ids = candidates.map((candidate) => candidate.id);
        for (const group of results.data) {
            check.expect(
                ids.includes(group.resource),
                `Results of "${group.resource}", which is not a searchable resource.`,
            );
            check.expect(
                group.items.length <= SEARCH_DEFAULT_LIMIT,
                `"${group.resource}" has ${group.items.length} results; without a limit, at most ${SEARCH_DEFAULT_LIMIT}.`,
            );
        }
        const count = results.data.reduce((total, group) => total + group.items.length, 0);
        check.expect(
            count <= SEARCH_MAX_LIMIT,
            `The results have ${count} items, at most ${SEARCH_MAX_LIMIT}.`,
        );
        check.expect(
            results.data.some((group) => group.resource === target.id && group.items.length > 0),
            `Searching "${term}", a word of the title of an item of "${target.id}", finds none of its items.`,
        );
    });

    await run('search.scope', 'GET /search reads limit and resources', async (check) => {
        const reason = searchSkip();
        if (reason !== null || searched === null) {
            check.skip(reason ?? '');
            return;
        }
        const { resource: target, term } = searched as { resource: Resource; term: string };
        const reply = await search({ q: term, limit: 1, resources: [target.id] });
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const results = check.expectSchema(SearchResponse, reply.body, 'The results');
        if (results !== null) {
            check.expect(
                results.data.length === 1 &&
                    results.data[0]?.resource === target.id &&
                    results.data[0].items.length === 1,
                `With limit=1&resources=${target.id}, expected one item of "${target.id}", got ${JSON.stringify(results.data.map((group) => [group.resource, group.items.length]))}.`,
            );
        }
    });

    await run(
        'search.invalid',
        'An invalid search is a 422 problem, with errors keyed by parameter',
        async (check) => {
            const reason = searchSkip();
            if (reason !== null || searched === null) {
                check.skip(reason ?? '');
                return;
            }
            const { term } = searched as { resource: Resource; term: string };
            const invalid: [string, SearchQuery][] = [
                ['q', { q: term.slice(0, 1) }],
                ['limit', { q: term, limit: 0 }],
                ['limit', { q: term, limit: SEARCH_MAX_LIMIT + 1 }],
                ['resources', { q: term, resources: [UNKNOWN] }],
            ];
            for (const [parameter, query] of invalid) {
                const failure = check.expectProblem(await search(query), 422);
                if (failure !== null) {
                    check.expect(
                        failure.errors?.[parameter] !== undefined,
                        `${toSearchQueryParams(query)}: the 422 problem must have errors.${parameter}.`,
                    );
                }
            }
        },
    );

    const writes = options.writes;
    let createdId: string | null = null;
    let createdVersion: string | null = null;
    let updatedVersion: string | null = null;

    await run(
        'abilities.create',
        'The resources the user can’t create items of answer 403 to a create',
        async (check) => {
            const current = definition as Definition | null;
            if (writes === undefined || current === null) {
                check.skip('Write checks are disabled.');
                return;
            }
            const denied = current.resources.filter(
                (candidate) => candidate.abilities?.create === false,
            );
            if (denied.length === 0) {
                check.skip('The user can create items of every resource.');
                return;
            }
            for (const candidate of denied) {
                // Empty values: a backend that wrongly accepts them has nothing to save.
                const reply = await request(`/resources/${encodeURIComponent(candidate.id)}`, {
                    method: 'POST',
                    body: '{}',
                });
                check.expect(
                    reply.status === 403,
                    `${candidate.id} has \`create: false\`, but a create answered ${reply.status}.`,
                );
            }
        },
    );

    await run(
        'abilities.update',
        'An item the user can’t update answers 403 to an update',
        async (check) => {
            if (writes === undefined || resource === null) {
                check.skip('Write checks are disabled.');
                return;
            }
            const items = await listItems(check);
            const denied = items?.find((item) => item.abilities.update !== true);
            if (items === null) {
                return;
            }
            if (denied === undefined) {
                check.skip('Every item of the first page can be updated.');
                return;
            }
            // An empty update: a backend that wrongly accepts it changes nothing.
            const reply = await request(`${resourcePath()}/${encodeURIComponent(denied.id)}`, {
                method: 'PATCH',
                body: '{}',
                headers: denied.version !== null ? { 'If-Match': `"${denied.version}"` } : {},
            });
            check.expect(
                reply.status === 403,
                `Item ${denied.id} can’t be updated, but an update answered ${reply.status}.`,
            );
        },
    );

    await run('create.invalid', 'Invalid values are refused with a 422 problem', async (check) => {
        if (writes === undefined || resource === null) {
            check.skip('Write checks are disabled.');
            return;
        }
        const hasRequired = resource.fields.some((field) =>
            (field.rules ?? []).some(
                (rule) => rule.rule === 'required' && (rule.mode ?? 'create') === 'create',
            ),
        );
        if (writes.invalid === undefined && !hasRequired) {
            check.skip('No invalid values given, and the resource has no required field.');
            return;
        }
        const reply = await request(resourcePath(), {
            method: 'POST',
            body: JSON.stringify(writes.invalid ?? {}),
        });
        const failure = check.expectProblem(reply, 422);
        if (failure !== null) {
            check.expect(
                failure.errors !== undefined && Object.keys(failure.errors).length > 0,
                'A 422 problem must list the invalid values in `errors`.',
            );
        }
    });

    await run('create', 'POST /resources/{resource} creates an item', async (check) => {
        if (writes === undefined || resource === null) {
            check.skip('Write checks are disabled.');
            return;
        }
        const reply = await request(resourcePath(), {
            method: 'POST',
            body: JSON.stringify(writes.create),
        });
        if (!check.expectStatus(reply, 201)) {
            return;
        }
        const item = check.expectSchema(ItemResponse, reply.body, 'The created item');
        createdId = item?.data.id ?? null;
        createdVersion = item?.data.version ?? null;
    });

    const itemPath = () => `${resourcePath()}/${encodeURIComponent(createdId ?? '')}`;

    await run('update', 'PATCH /resources/{resource}/{id} updates the item', async (check) => {
        if (createdId === null || writes === undefined) {
            check.skip('No item was created.');
            return;
        }
        const reply = await request(itemPath(), {
            method: 'PATCH',
            body: JSON.stringify(writes.update),
            headers: createdVersion !== null ? { 'If-Match': `"${createdVersion}"` } : {},
        });
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const item = check.expectSchema(ItemResponse, reply.body, 'The updated item');
        if (item !== null && createdVersion !== null) {
            check.expect(
                item.data.version !== createdVersion,
                'The version did not change after an update.',
            );
        }
        updatedVersion = item?.data.version ?? null;
    });

    await run(
        'update.create-rules',
        'Rules limited to create do not apply to updates',
        async (check) => {
            if (createdId === null || writes === undefined || resource === null) {
                check.skip('No item was created.');
                return;
            }
            // A password: required to create the item, left empty to keep it on an update.
            const names = resource.fields
                .filter(
                    (field) =>
                        field.readOnly !== true &&
                        field.createOnly !== true &&
                        (field.rules ?? []).some(
                            (rule) => rule.rule === 'required' && rule.mode === 'create',
                        ),
                )
                .map((field) => field.name);
            if (names.length === 0) {
                check.skip('The resource has no rule limited to create.');
                return;
            }
            const reply = await request(itemPath(), {
                method: 'PATCH',
                body: JSON.stringify(Object.fromEntries(names.map((name) => [name, null]))),
                headers: updatedVersion !== null ? { 'If-Match': `"${updatedVersion}"` } : {},
            });
            check.expect(
                reply.status === 200,
                `An update with ${names.join(', ')} set to null got status ${reply.status}, expected 200.`,
            );
        },
    );

    await run(
        'update.single-field',
        'A PATCH with a single field and If-Match changes that field alone',
        async (check) => {
            if (createdId === null || writes === undefined || resource === null) {
                check.skip('No item was created.');
                return;
            }
            // As a list edits a field in place: the item's version, and the one field
            const current = await request(itemPath());
            const before = check.expectStatus(current, 200)
                ? check.expectSchema(ItemResponse, current.body, 'The item')
                : null;
            if (before === null) {
                return;
            }
            // A value of the update set back to the one it was created with: a real change.
            const name = Object.keys(writes.update).find(
                (key) => key in writes.create && !isEqual(writes.create[key], before.data[key]),
            );
            if (name === undefined) {
                check.skip(
                    'No value of the update of `writes` differs from its value in `create`, to set it back.',
                );
                return;
            }
            const version = before.data.version;
            const reply = await request(itemPath(), {
                method: 'PATCH',
                body: JSON.stringify({ [name]: writes.create[name] }),
                headers: version !== null ? { 'If-Match': `"${version}"` } : {},
            });
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const after = check.expectSchema(ItemResponse, reply.body, 'The updated item');
            if (after === null) {
                return;
            }
            if (version !== null) {
                check.expect(
                    after.data.version !== version,
                    'The version did not change after an update of a single field.',
                );
            }
            const changed = resource.fields
                .filter(
                    (field) =>
                        field.name !== name &&
                        field.readOnly !== true &&
                        field.settings?.secret !== true &&
                        !isEqual(before.data[field.name], after.data[field.name]),
                )
                .map((field) => field.name);
            check.expect(
                changed.length === 0,
                `An update of ${name} alone also changed ${changed.join(', ')}.`,
            );
            updatedVersion = after.data.version;
        },
    );

    await run(
        'update.conflict',
        'A stale If-Match is a 412 problem with the current item',
        async (check) => {
            if (createdId === null || writes === undefined) {
                check.skip('No item was created.');
                return;
            }
            if (createdVersion === null) {
                check.skip('The backend has no versions.');
                return;
            }
            const reply = await request(itemPath(), {
                method: 'PATCH',
                body: JSON.stringify(writes.update),
                headers: { 'If-Match': '"__panneau_conformance_stale__"' },
            });
            const failure = check.expectProblem(reply, 412);
            if (failure !== null) {
                check.expect(
                    failure.current !== undefined,
                    'A 412 problem must include the current item.',
                );
            }
        },
    );

    await run(
        'duplicate',
        'POST /resources/{resource}/{id}/duplicate copies an item that allows it',
        async (check) => {
            if (createdId === null) {
                check.skip('No item was created.');
                return;
            }
            const reply = await request(itemPath());
            const created = check.expectStatus(reply, 200)
                ? check.expectSchema(ItemResponse, reply.body, 'The item')
                : null;
            if (created === null) {
                return;
            }
            // The built-in `duplicate` is only shown on items that allow it (decision 0040).
            if (created.data.abilities.duplicate !== true) {
                check.skip("The item doesn't allow `duplicate`.");
                return;
            }
            const copy = await request(`${itemPath()}/duplicate`, { method: 'POST' });
            if (!check.expectStatus(copy, 201)) {
                return;
            }
            const duplicated = check.expectSchema(ItemResponse, copy.body, 'The copy');
            if (duplicated === null) {
                return;
            }
            check.expect(
                copy.etag !== null && normalizeEtag(copy.etag) === `"${duplicated.data.version}"`,
                `Expected the ETag of the copy, "${duplicated.data.version}" (quoted), got ${copy.etag ?? 'none'}.`,
            );
            check.expect(
                duplicated.data.id !== created.data.id,
                'The copy has the id of the item it copies.',
            );
            // Clean up the copy
            await request(`${resourcePath()}/${encodeURIComponent(duplicated.data.id)}`, {
                method: 'DELETE',
            });
        },
    );

    await run('delete', 'DELETE /resources/{resource}/{id} deletes the item', async (check) => {
        if (createdId === null) {
            check.skip('No item was created.');
            return;
        }
        if (!check.expectStatus(await request(itemPath(), { method: 'DELETE' }), 204)) {
            return;
        }
        check.expectProblem(await request(itemPath()), 404);
    });

    return { passed: checks.every((check) => check.status !== 'failed'), checks };
}

/** Formats a report as text, one line per check. */
export function formatReport(report: ConformanceReport): string {
    const symbols: Record<ConformanceStatus, string> = { passed: '✓', failed: '✗', skipped: '-' };
    return report.checks
        .map((check) =>
            [
                `${symbols[check.status]} ${check.title}`,
                ...check.issues.map((issue) => `    ${issue}`),
            ].join('\n'),
        )
        .join('\n');
}
