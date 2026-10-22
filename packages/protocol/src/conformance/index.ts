import type { z } from 'zod';

import { type FilterRange, toSearchParams } from '../query';
import { Definition, type Resource } from '../schemas';
import {
    ActionResult,
    ItemResponse,
    ListResponse,
    Problem,
    SearchResponse,
    UploadSignResponse,
} from '../schemas/api';
import {
    SEARCH_DEFAULT_LIMIT,
    SEARCH_MAX_LIMIT,
    type SearchQuery,
    isSearchableResource,
    toSearchQueryParams,
} from '../search';
import { isFilled } from '../values';
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

    const resourcePath = () =>
        `/resources/${encodeURIComponent((resource as Resource | null)?.id ?? '')}`;

    await run('list', 'GET /resources/{resource} returns a page of items', async (check) => {
        if (resource === null) {
            check.skip('No resource to test.');
            return;
        }
        const reply = await request(`${resourcePath()}?page=1&perPage=2`);
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const list = check.expectSchema(ListResponse, reply.body, 'The list');
        if (list === null) {
            return;
        }
        check.expect(list.data.length <= 2, `perPage=2 returned ${list.data.length} items.`);
        check.expect(list.meta.page === 1, `meta.page is ${list.meta.page}, expected 1.`);
        check.expect(list.meta.perPage === 2, `meta.perPage is ${list.meta.perPage}, expected 2.`);
        firstItemId = list.data[0]?.id ?? null;
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
            for (const [range, label] of ranges) {
                const reply = await list(range, `The list filtered ${label}`);
                if (reply !== null) {
                    check.expect(
                        reply.meta.total >= dated,
                        `Filtered ${label}, the list has ${reply.meta.total} items; the first page alone has ${dated} with a ${filter.id}.`,
                    );
                }
            }
            const future = await list({ from: '9999-12-31' }, 'The list filtered from 9999-12-31');
            if (future !== null) {
                check.expect(
                    future.meta.total === 0,
                    `Filtered from 9999-12-31, the list has ${future.meta.total} items, expected 0.`,
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

    await run('create.invalid', 'Invalid values are refused with a 422 problem', async (check) => {
        if (writes === undefined || resource === null) {
            check.skip('Write checks are disabled.');
            return;
        }
        const hasRequired = resource.fields.some((field) =>
            (field.rules ?? []).some((rule) => rule.rule === 'required'),
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
    });

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
