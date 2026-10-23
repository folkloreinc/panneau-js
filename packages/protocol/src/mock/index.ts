import { getMediaLibraries } from '../libraries';
import { type ListQuery, fromSearchParams, isFilterRange, matchesFilterRange } from '../query';
import { type RuleFailure, checkValues } from '../rules';
import type { DefinitionInput, ResourceInput } from '../schemas';
import type {
    ActionResult,
    FieldCheckResponse,
    Item,
    MediaInfo,
    MediaReference,
    PreviewResponse,
    Problem,
    SearchResponse,
    Selection,
    StoredFile,
    Upload,
    UploadSignResponse,
} from '../schemas/api';
import { SEARCH_MAX_LIMIT, readSearchQuery } from '../search';
import { isRecord } from '../values';
import { PROBLEM_CONTENT_TYPE } from '../version';

type Values = Record<string, unknown>;

export interface MockBackendOptions {
    /** The definition served by `GET /definition`. Its `api.baseUrl` is the prefix of every route. */
    definition: DefinitionInput;
    /** Initial values of the items, per resource id. Items without an `id` get one. */
    items?: Record<string, Values[]>;
    /**
     * The URL that `POST /resources/{resource}/{id}/preview` returns, for the item with the posted
     * values. Defaults to a `data:` URL of a plain page with the item's values.
     */
    previewUrl?: (context: { resource: string; item: Item }) => string;
}

export interface MockBackend {
    /** A `fetch`-compatible function that answers protocol requests. */
    fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
    /** The current items of a resource. */
    items: (resource: string) => Item[];
}

const RESERVED_KEYS = new Set(['id', 'version', 'abilities']);

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

/** A plain page with the values of an item, as a `data:` URL, for iframe previews. */
function defaultPreviewUrl(item: Item): string {
    const rows = Object.entries(item)
        .filter(([key]) => !RESERVED_KEYS.has(key))
        .map(
            ([key, value]) =>
                `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value))}</dd>`,
        )
        .join('');
    const html = `<!doctype html><meta charset="utf-8"><title>Preview</title><body style="font-family:system-ui;margin:2rem"><h1>Item ${escapeHtml(item.id)}</h1><dl>${rows}</dl></body>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

const DEFAULT_MESSAGES: Record<string, (failure: RuleFailure) => string> = {
    required: () => 'This field is required.',
    min: (failure) => `This value must be at least ${String(failure.value)}.`,
    max: (failure) => `This value must be at most ${String(failure.value)}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    json: () => 'This value must be valid JSON: an object or an array.',
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
    crop: (failure) => {
        const ratios = isRecord(failure.value) ? failure.value.ratios : undefined;
        return Array.isArray(ratios) && ratios.length > 0
            ? `Crop this image to ${ratios.join(' or ')}.`
            : 'Crop this image.';
    },
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
            // A filter that isn't a value of the item reads its `media`: `filter[type]=image`.
            const value =
                key in item ? item[key] : isRecord(item.media) ? item.media[key] : undefined;
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

/** The type of a media, from its MIME type. */
function mediaType(mime: string | null | undefined): string {
    const family = (mime ?? '').split('/')[0] ?? '';
    if (family === 'image' || family === 'video' || family === 'audio') {
        return family;
    }
    return mime === 'application/pdf' || family === 'text' ? 'document' : 'other';
}

/** What the mock computes about a stored file: no renditions, ready at once. */
function mediaOf(file: StoredFile): MediaInfo {
    const type = mediaType(file.mime);
    return {
        type,
        mime: file.mime ?? null,
        size: file.size ?? null,
        url: file.url ?? null,
        thumbnailUrl: type === 'image' ? (file.url ?? null) : null,
        status: 'ready',
    };
}

/**
 * A media item with its own transform (its `transform` field) in its `media`, where references
 * give it to clients (decision 0031).
 */
function withOwnTransform(resource: ResourceInput, item: Item): Item {
    if (resource.kind !== 'media' || !isRecord(item.media)) {
        return item;
    }
    const { transform: _previous, ...media } = item.media;
    return {
        ...item,
        media: isRecord(item.transform) ? { ...media, transform: item.transform } : media,
    };
}

/**
 * An in-memory backend that implements the protocol's resource routes: definition, list, show,
 * create, update (with `If-Match`), delete and the built-in `delete` action. Values are checked
 * with the portable rules. Used to test the conformance kit, and to develop frontends without a
 * real backend.
 */
export function createMockBackend(options: MockBackendOptions): MockBackend {
    const { definition, items = {} } = options;
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
            if (upload === undefined) {
                return problem(404, 'Upload not found.');
            }
            const { name } = await readBody();
            if (typeof name === 'string') {
                upload.name = name;
            }
            return json(200, { data: upload });
        }
        return problem(404, 'Not found.');
    };

    // The values of `file` fields at the top of a resource: an upload becomes a stored file, and
    // a stored file or null is kept. Returns the paths of uploads that don't exist.
    const resolveFiles = (
        resource: ResourceInput,
        values: Values,
    ): { values: Values; missing: string[] } => {
        const missing: string[] = [];
        const resolved = { ...values };
        const toFile = (value: unknown, path: string): unknown => {
            if (!isRecord(value) || typeof value.upload !== 'string') {
                return value;
            }
            const upload = uploads.get(value.upload);
            if (upload === undefined) {
                missing.push(path);
                return value;
            }
            const file: StoredFile = {
                name: upload.name ?? (typeof value.name === 'string' ? value.name : upload.id),
                url: `https://storage.test/${upload.key ?? upload.id}`,
                mime: upload.mime ?? (typeof value.mime === 'string' ? value.mime : null),
                size: upload.size ?? (typeof value.size === 'number' ? value.size : null),
            };
            return file;
        };
        resource.fields
            .filter((field) => field.type === 'file' && field.name in values)
            .forEach((field) => {
                const value = values[field.name];
                resolved[field.name] = Array.isArray(value)
                    ? value.map((entry, index) => toFile(entry, `${field.name}.${String(index)}`))
                    : toFile(value, field.name);
            });
        return { values: resolved, missing };
    };

    const missingMedia = (paths: Record<string, string>) =>
        problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                Object.entries(paths).map(([path, message]) => [path, [message]]),
            ),
        });

    const missingUploads = (paths: string[]) =>
        problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                paths.map((path) => [path, ['This upload does not exist.']]),
            ),
        });

    // The values of `media` and `image` fields at the top of a resource: an id, or
    // `{ id, resource, transform }`, becomes a reference to a media of one of its libraries. A
    // field that allows several libraries needs the library of each media (decision 0027).
    // Returns the problems by path.
    const resolveMedia = (
        resource: ResourceInput,
        values: Values,
    ): { values: Values; missing: Record<string, string> } => {
        const missing: Record<string, string> = {};
        const resolved = { ...values };
        resource.fields
            .filter(
                (field) =>
                    (field.type === 'media' || field.type === 'image') && field.name in values,
            )
            .forEach((field) => {
                const allowed = getMediaLibraries(definition, field);
                const toReference = (value: unknown, path: string): unknown => {
                    const id = isRecord(value) ? value.id : value;
                    if (typeof id !== 'string' && typeof id !== 'number') {
                        return value;
                    }
                    const named =
                        isRecord(value) && typeof value.resource === 'string'
                            ? value.resource
                            : undefined;
                    if (named === undefined && allowed.length > 1) {
                        missing[path] = 'This field allows several libraries: name the library.';
                        return value;
                    }
                    const libraryId = named ?? allowed[0];
                    const library = definition.resources.find(
                        (candidate) => candidate.id === libraryId && allowed.includes(candidate.id),
                    );
                    const media = (store.get(library?.id ?? '') ?? []).find(
                        (candidate) => candidate.id === String(id),
                    );
                    if (media === undefined || library === undefined) {
                        missing[path] = 'This media does not exist.';
                        return value;
                    }
                    const title = media[library.itemTitle ?? 'name'];
                    const reference: MediaReference = {
                        id: media.id,
                        ...(allowed.length > 1 ? { resource: library.id } : {}),
                        ...(typeof title === 'string' ? { label: title } : {}),
                        ...(isRecord(media.media) ? { media: media.media as MediaInfo } : {}),
                        ...(isRecord(value) && isRecord(value.transform)
                            ? { transform: value.transform }
                            : {}),
                    };
                    return reference;
                };
                const value = values[field.name];
                resolved[field.name] = Array.isArray(value)
                    ? value.map((entry, index) =>
                          toReference(entry, `${field.name}.${String(index)}`),
                      )
                    : toReference(value, field.name);
            });
        return { values: resolved, missing };
    };

    // Resolves the files and media of the values, and computes the `media` of a media item from
    // its file. The client never sets `media`.
    const resolveValues = (
        resource: ResourceInput,
        body: Values,
    ): { values: Values; problem: Response | null } => {
        const sent = { ...body };
        if (resource.kind === 'media') {
            delete sent.media;
        }
        const files = resolveFiles(resource, sent);
        if (files.missing.length > 0) {
            return { values: body, problem: missingUploads(files.missing) };
        }
        const media = resolveMedia(resource, files.values);
        if (Object.keys(media.missing).length > 0) {
            return { values: body, problem: missingMedia(media.missing) };
        }
        const values = media.values;
        if (resource.kind === 'media' && isRecord(values.file)) {
            values.media = mediaOf(values.file as StoredFile);
        }
        return { values, problem: null };
    };

    // The global search (decision 0029): the searchable resources asked for, `limit` items each
    // (5 by default), 20 in all, from 2 characters.
    const search = (params: URLSearchParams): Response => {
        const read = readSearchQuery(params, definition);
        if (read.errors !== undefined) {
            return problem(422, 'The given data was invalid.', {
                type: 'urn:panneau:problem:validation',
                errors: read.errors,
            });
        }
        const { q, limit, resources } = read.query;
        let left = SEARCH_MAX_LIMIT;
        const data: SearchResponse['data'] = resources.flatMap((id) => {
            if (left === 0) {
                return [];
            }
            const found = applyQuery(store.get(id) ?? [], { q });
            const items = found.slice(0, Math.min(limit, left));
            left -= items.length;
            return items.length > 0 ? [{ resource: id, items, total: found.length }] : [];
        });
        return json(200, { data } satisfies SearchResponse);
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
        if (segments.length === 1 && segments[0] === 'search' && method === 'GET') {
            return search(url.searchParams);
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
                const body = await readBody();
                const invalid = validationProblem(resource, body, 'create');
                if (invalid !== null) {
                    return invalid;
                }
                const { values, problem: unresolved } = resolveValues(resource, body);
                if (unresolved !== null) {
                    return unresolved;
                }
                const item = withOwnTransform(
                    resource,
                    makeItem(resource, { ...values, id: undefined }),
                );
                list.push(item);
                return json(201, { data: item }, etag(item));
            }
            return problem(405, 'Method not allowed.');
        }

        if (segments[2] === 'fields' && segments[4] === 'check' && segments.length === 5) {
            if (method !== 'POST') {
                return problem(405, 'Method not allowed.');
            }
            const field = resource.fields.find(
                (candidate) => candidate.name === segments[3] && candidate.check === true,
            );
            if (field === undefined) {
                return problem(404, 'Field not found.');
            }
            const body = await readBody();
            if (typeof body.value !== 'string') {
                return problem(422, 'The given data was invalid.', {
                    type: 'urn:panneau:problem:validation',
                    errors: { value: ['The value is required.'] },
                });
            }
            const locale = typeof body.locale === 'string' ? body.locale : null;
            const id =
                typeof body.id === 'string' || typeof body.id === 'number' ? String(body.id) : null;
            const valueOf = (item: Item): unknown => {
                const value = item[field.name];
                return locale !== null && isRecord(value) ? value[locale] : value;
            };
            const taken = (candidate: string) =>
                list.some((item) => item.id !== id && valueOf(item) === candidate);
            const available = !taken(body.value);
            let suggestion: string | null = null;
            for (let index = 2; !available && suggestion === null; index += 1) {
                const candidate = `${body.value}-${String(index)}`;
                suggestion = taken(candidate) ? null : candidate;
            }
            // The mock gives a URL when the field has a fixed prefix
            const prefix =
                typeof field.settings?.prefix === 'string' ? field.settings.prefix : null;
            const response: FieldCheckResponse = {
                available,
                suggestion,
                prefix,
                url: prefix !== null ? `${prefix}${body.value}` : null,
            };
            return json(200, response);
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

        if (segments.length === 4 && segments[3] === 'preview' && segments[2] !== undefined) {
            const current = list.find((item) => item.id === segments[2]);
            if (current === undefined) {
                return problem(404, 'Item not found.');
            }
            if (method !== 'POST') {
                return problem(405, 'Method not allowed.');
            }
            const body = await readBody();
            const item: Item = { ...current, ...(isRecord(body) ? body : {}) };
            const url =
                options.previewUrl?.({ resource: resource.id, item }) ?? defaultPreviewUrl(item);
            return json(200, {
                url,
                expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
            } satisfies PreviewResponse);
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
            const body = await readBody();
            const invalid = validationProblem(resource, body, 'update');
            if (invalid !== null) {
                return invalid;
            }
            const { values, problem: unresolved } = resolveValues(resource, body);
            if (unresolved !== null) {
                return unresolved;
            }
            const updates = Object.fromEntries(
                Object.entries(values).filter(([key]) => !RESERVED_KEYS.has(key)),
            );
            const updated = withOwnTransform(resource, {
                ...current,
                ...updates,
                version: current.version === null ? null : String(Number(current.version) + 1),
            });
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
