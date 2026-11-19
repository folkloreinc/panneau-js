// A run of the conformance kit: its requests, its checks, and what the first checks found.
import { CONTEXT_HEADER } from '../constants';
import { formatContextHeader } from '../context';
import type { Definition, Resource } from '../schemas';
import { type Item, ListResponse } from '../schemas/api';
import { Check, type Reply } from './check';
import type { ConformanceCheck, ConformanceOptions, ConformanceStatus } from './types';

/** What the first checks found, for the others: the definition and the resource to test. */
export interface ConformanceState {
    definition: Definition | null;
    resource: Resource | null;
}

export interface ConformanceRun {
    options: ConformanceOptions;
    /** The base URL, without its trailing slash. */
    baseUrl: string;
    /** The checks run so far, in order. */
    checks: ConformanceCheck[];
    /** A request to the API, with the headers of the options. */
    request: (path: string, init?: RequestInit) => Promise<Reply>;
    /** Runs a check, and adds it to the report. */
    run: (id: string, title: string, body: (check: Check) => Promise<void>) => Promise<void>;
    state: ConformanceState;
}

export function createRun(options: ConformanceOptions): ConformanceRun {
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

    return {
        options,
        baseUrl,
        checks,
        request,
        run,
        state: { definition: null, resource: null },
    };
}

/** The path of the list of a resource. */
export function getResourcePath(resource: Resource | null): string {
    return `/resources/${encodeURIComponent(resource?.id ?? '')}`;
}

/** The first page of the tested resource, at most 20 items. */
export async function listItems(ctx: ConformanceRun, check: Check): Promise<Item[] | null> {
    const { resource } = ctx.state;
    const cursors = resource?.list?.pagination === 'cursor';
    const reply = await ctx.request(
        `${getResourcePath(resource)}?${cursors ? '' : 'page=1&'}perPage=20`,
    );
    if (!check.expectStatus(reply, 200)) {
        return null;
    }
    return check.expectSchema(ListResponse, reply.body, 'The list')?.data ?? null;
}
