import { type ListQuery, fromSearchParams, isFilterRange, matchesFilterRange } from '../query';
import { type RuleFailure, checkValues } from '../rules';
import type { DefinitionInput, ResourceInput } from '../schemas';
import type {
    ActionResult,
    Item,
    Problem,
    Selection,
    Upload,
    UploadSignResponse,
} from '../schemas/api';
import { isRecord } from '../values';
import { PROBLEM_CONTENT_TYPE } from '../version';

type Values = Record<string, unknown>;

export interface MockBackendOptions {
    /** The definition served by `GET /definition`. Its `api.baseUrl` is the prefix of every route. */
    definition: DefinitionInput;
    /** Initial values of the items, per resource id. Items without an `id` get one. */
    items?: Record<string, Values[]>;
}

export interface MockBackend {
    /** A `fetch`-compatible function that answers protocol requests. */
    fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
    /** The current items of a resource. */
    items: (resource: string) => Item[];
}

const RESERVED_KEYS = new Set(['id', 'version', 'abilities']);

const DEFAULT_MESSAGES: Record<string, (failure: RuleFailure) => string> = {
    required: () => 'This field is required.',
    min: (failure) => `This value must be at least ${String(failure.value)}.`,
    max: (failure) => `This value must be at most ${String(failure.value)}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
};

function message(failure: RuleFailure): string {
    return failure.message ?? DEFAULT_MESSAGES[failure.rule]?.(failure) ?? 'This value is invalid.';
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
    return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: status === 204 ? headers : { 'Content-Type': 'application/json', ...headers },
    });
}

function problem(status: number, title: string, extra: Partial<Problem> = {}): Response {
    const body: Problem = { type: 'about:blank', title, status, ...extra };
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': PROBLEM_CONTENT_TYPE },
    });
}

function etag(item: Item): Record<string, string> {
    return item.version === null ? {} : { ETag: `"${item.version}"` };
}

function parseEtag(value: string): string {
    return value.replace(/^W\//, '').replace(/^"(.*)"$/, '$1');
}

function searchableText(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (isRecord(value)) {
        return Object.values(value).map(searchableText).join(' ');
    }
    return '';
}

function compare(a: unknown, b: unknown): number {
    const left = isRecord(a) ? searchableText(a) : a;
    const right = isRecord(b) ? searchableText(b) : b;
    if (left === right) {
        return 0;
    }
    if (left === undefined || left === null) {
        return 1;
    }
    if (right === undefined || right === null) {
        return -1;
    }
    return String(left).localeCompare(String(right), undefined, { numeric: true });
}

function applyQuery(items: Item[], query: Pick<ListQuery, 'filter' | 'q' | 'sort'>): Item[] {
    let result = items;
    Object.entries(query.filter ?? {}).forEach(([key, expected]) => {
        if (isFilterRange(expected)) {
            result = result.filter((item) => matchesFilterRange(item[key], expected));
            return;
        }
        const accepted = (Array.isArray(expected) ? expected : [expected]).map(String);
        result = result.filter((item) => {
            const value = item[key];
            const values = Array.isArray(value) ? value : [value];
            return values.some((candidate) => accepted.includes(String(candidate)));
        });
    });
    if (query.q !== undefined && query.q !== '') {
        const terms = query.q.toLowerCase();
        result = result.filter((item) =>
            Object.entries(item)
                .filter(([key]) => !RESERVED_KEYS.has(key))
                .some(([, value]) => searchableText(value).toLowerCase().includes(terms)),
        );
    }
    const sort = query.sort ?? [];
    if (sort.length > 0) {
        result = [...result].sort((a, b) => {
            for (const part of sort) {
                const descending = part.startsWith('-');
                const key = descending ? part.slice(1) : part;
                const order = compare(a[key], b[key]);
                if (order !== 0) {
                    return descending ? -order : order;
                }
            }
            return 0;
        });
    }
    return result;
}

/**
 * An in-memory backend that implements the protocol's resource routes: definition, list, show,
 * create, update (with `If-Match`), delete and the built-in `delete` action. Values are checked
 * with the portable rules. Used to test the conformance kit, and to develop frontends without a
 * real backend.
 */
export function createMockBackend({ definition, items = {} }: MockBackendOptions): MockBackend {
    const store = new Map<string, Item[]>();
    let nextId = 1;

    const abilitiesFor = (resource: ResourceInput) =>
        Object.fromEntries([
            ['update', true],
            ['delete', true],
            ...(resource.actions ?? []).map((action) => [action.id, true]),
        ]);

    const makeItem = (resource: ResourceInput, values: Values): Item => {
        const id =
            typeof values.id === 'string' || typeof values.id === 'number'
                ? String(values.id)
                : String(nextId++);
        const rest = Object.fromEntries(
            Object.entries(values).filter(([key]) => !RESERVED_KEYS.has(key)),
        );
        return { ...rest, id, version: '1', abilities: abilitiesFor(resource) };
    };

    definition.resources.forEach((resource) => {
        store.set(
            resource.id,
            (items[resource.id] ?? []).map((values) => makeItem(resource, values)),
        );
    });

    const basePath = new URL(definition.api.baseUrl, 'http://panneau.test').pathname.replace(
        /\/$/,
        '',
    );

    const validationProblem = (
        resource: ResourceInput,
        values: Values,
        mode: 'create' | 'update',
    ) => {
        const failures = checkValues(resource.fields, values, {
            mode,
            partial: mode === 'update',
            locales: definition.locales,
        });
        const paths = Object.keys(failures);
        if (paths.length === 0) {
            return null;
        }
        return problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                paths.map((path) => [path, (failures[path] ?? []).map(message)]),
            ),
        });
    };

    const selectItems = (list: Item[], selection: Selection | undefined): Item[] => {
        if (selection === undefined) {
            return [];
        }
        if ('ids' in selection) {
            const ids = selection.ids as string[];
            return list.filter((item) => ids.includes(item.id));
        }
        const except = selection.except ?? [];
        const { filter, q } = selection.query;
        const query: Pick<ListQuery, 'filter' | 'q'> = {};
        if (filter !== undefined) {
            query.filter = filter as NonNullable<ListQuery['filter']>;
        }
        if (q !== undefined) {
            query.q = q;
        }
        return applyQuery(list, query).filter((item) => !except.includes(item.id));
    };

    // Direct uploads: the open uploads by id, with their key. The mock signs fake URLs, and
    // trusts the client when it completes an upload.
    const uploads = new Map<string, Upload>();
    let nextUpload = 1;

    const handleUploads = async (
        segments: string[],
        method: string,
        readBody: () => Promise<Values>,
    ): Promise<Response> => {
        if (definition.uploads?.mode !== 'presigned') {
            return problem(404, 'Not found.');
        }
        if (method !== 'POST') {
            return problem(405, 'Method not allowed.');
        }
        if (segments.length === 2 && segments[1] === 'sign') {
            const body = await readBody();
            const opens =
                body.uploadId === undefined && (body.method === 'POST' || body.method === 'PUT');
            if (opens) {
                const id = `upl_${nextUpload++}`;
                const upload: Upload = { id, key: `uploads/${id}` };
                uploads.set(id, upload);
                const response: UploadSignResponse = {
                    url: `https://storage.test/${upload.key}?signature=mock`,
                    key: upload.key,
                    upload: id,
                };
                return json(200, response);
            }
            const upload = [...uploads.values()].find((candidate) => candidate.key === body.key);
            if (upload === undefined) {
                return problem(404, 'Upload not found.');
            }
            return json(200, { url: `https://storage.test/${upload.key}?signature=mock` });
        }
        if (segments.length === 3 && segments[2] === 'complete' && segments[1] !== undefined) {
            const upload = uploads.get(segments[1]);
            return upload !== undefined
                ? json(200, { data: upload })
                : problem(404, 'Upload not found.');
        }
        return problem(404, 'Not found.');
    };

    const handle = async (request: Request): Promise<Response> => {
        const url = new URL(request.url, 'http://panneau.test');
        if (!url.pathname.startsWith(basePath)) {
            return problem(404, 'Not found.');
        }
        const segments = url.pathname
            .slice(basePath.length)
            .split('/')
            .filter((segment) => segment !== '')
            .map(decodeURIComponent);
        const method = request.method.toUpperCase();
        const readBody = async (): Promise<Values> => {
            const body: unknown = await request.json().catch(() => null);
            return isRecord(body) ? body : {};
        };

        if (segments.length === 1 && segments[0] === 'definition' && method === 'GET') {
            return json(200, definition);
        }
        if (segments[0] === 'uploads') {
            return handleUploads(segments, method, readBody);
        }
        if (segments[0] !== 'resources' || segments[1] === undefined) {
            return problem(404, 'Not found.');
        }

        const resource = definition.resources.find((candidate) => candidate.id === segments[1]);
        const list = resource !== undefined ? store.get(resource.id) : undefined;
        if (resource === undefined || list === undefined) {
            return problem(404, 'Resource not found.');
        }

        if (segments.length === 2) {
            if (method === 'GET') {
                const query = fromSearchParams(url.searchParams);
                const perPage = query.perPage ?? resource.list?.perPage ?? 20;
                const page = query.page ?? 1;
                const sort = query.sort ?? resource.list?.defaultSort?.split(',');
                const matching = applyQuery(list, {
                    ...query,
                    ...(sort !== undefined ? { sort } : {}),
                });
                return json(200, {
                    data: matching.slice((page - 1) * perPage, page * perPage),
                    meta: {
                        page,
                        perPage,
                        total: matching.length,
                        lastPage: Math.max(1, Math.ceil(matching.length / perPage)),
                    },
                });
            }
            if (method === 'POST') {
                const values = await readBody();
                const invalid = validationProblem(resource, values, 'create');
                if (invalid !== null) {
                    return invalid;
                }
                const item = makeItem(resource, { ...values, id: undefined });
                list.push(item);
                return json(201, { data: item }, etag(item));
            }
            return problem(405, 'Method not allowed.');
        }

        if (segments[2] === 'actions' && segments[3] !== undefined && segments.length === 4) {
            if (method !== 'POST') {
                return problem(405, 'Method not allowed.');
            }
            const actionId = segments[3];
            const action = (resource.actions ?? []).find((candidate) => candidate.id === actionId);
            const body = await readBody();
            if (body.dryRun === true) {
                // A dry run counts what the action would do, and changes nothing.
                if (action?.dryRun !== true) {
                    return problem(400, 'This action does not support dry runs.');
                }
                const selected = selectItems(list, body.selection as Selection | undefined);
                const allowed = selected.filter((item) => item.abilities?.[actionId] !== false);
                const result: ActionResult = {
                    summary: {
                        succeeded: allowed.length,
                        failed: 0,
                        skipped: selected.length - allowed.length,
                    },
                    results: selected
                        .filter((item) => !allowed.includes(item))
                        .slice(0, 20)
                        .map((item) => ({ id: item.id, status: 'skipped', reason: 'forbidden' })),
                };
                return json(200, result);
            }
            if (actionId !== 'delete') {
                return problem(404, 'Action not found.');
            }
            const selected = selectItems(list, body.selection as Selection | undefined);
            store.set(
                resource.id,
                list.filter((item) => !selected.includes(item)),
            );
            const result: ActionResult = {
                message: `${selected.length} deleted.`,
                summary: { succeeded: selected.length, failed: 0, skipped: 0 },
                refresh: 'list',
            };
            return json(200, result);
        }

        if (segments.length !== 3 || segments[2] === undefined) {
            return problem(404, 'Not found.');
        }
        const id = segments[2];
        const index = list.findIndex((item) => item.id === id);
        const current = list[index];
        if (current === undefined) {
            return problem(404, 'Item not found.');
        }

        if (method === 'GET') {
            return json(200, { data: current }, etag(current));
        }
        if (method === 'PATCH') {
            const ifMatch = request.headers.get('If-Match');
            if (
                ifMatch !== null &&
                current.version !== null &&
                parseEtag(ifMatch) !== current.version
            ) {
                return problem(412, 'The item was changed by someone else.', {
                    type: 'urn:panneau:problem:version-conflict',
                    current,
                });
            }
            const values = await readBody();
            const invalid = validationProblem(resource, values, 'update');
            if (invalid !== null) {
                return invalid;
            }
            const updates = Object.fromEntries(
                Object.entries(values).filter(([key]) => !RESERVED_KEYS.has(key)),
            );
            const updated: Item = {
                ...current,
                ...updates,
                version: current.version === null ? null : String(Number(current.version) + 1),
            };
            list[index] = updated;
            return json(200, { data: updated }, etag(updated));
        }
        if (method === 'DELETE') {
            list.splice(index, 1);
            return json(204, null);
        }
        return problem(405, 'Method not allowed.');
    };

    return {
        fetch: (input, init) => {
            if (input instanceof Request) {
                return handle(input);
            }
            // Relative URLs are accepted, as a browser would resolve them.
            return handle(new Request(new URL(input, 'http://panneau.test'), init));
        },
        items: (resource) => [...(store.get(resource) ?? [])],
    };
}

export { createExampleDefinition } from './example';
