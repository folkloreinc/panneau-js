import {
    CONTEXT_HEADER,
    CONTEXT_PROBLEM_TYPE,
    ITEM_ACTION_ABILITIES,
    isBuiltInItemAction,
} from '../constants';
import { type ContextValues, contextBefore, parseContextHeader } from '../context';
import { getMediaLibraries } from '../libraries';
import { type ListQuery, fromSearchParams, isFilterRange, matchesFilterRange } from '../query';
import { type RuleFailure, checkValues } from '../rules';
import type { ContextOption, DefinitionInput, ResourceInput } from '../schemas';
import type {
    ActionResult,
    EmbedValue,
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
    /**
     * The value of `GET /embeds?url=` for a URL, or `null` to refuse it with a `422`. Defaults to
     * a video for YouTube and Vimeo URLs, and a link for other web pages.
     */
    embed?: (url: string) => EmbedValue | null;
    /**
     * The current context, when the definition has `context` (decision 0043). The values of the
     * `Panneau-Context` header are checked against the choices of each param: a value that isn't
     * one is a `403` problem.
     */
    context?: MockContextOptions;
}

/** How the mock backend answers the context of its definition (decision 0043). */
export interface MockContextOptions {
    /**
     * Every choice of a param without inline `options`, for the values of the params before it.
     * `GET /context/{name}/options?q=` gives the first 20 whose label matches `q`.
     */
    options?: (name: string, before: ContextValues) => ContextOption[];
    /** Whether an item of a resource is in the context, for lists, items, actions and search. */
    scope?: (resource: string, item: Item, values: ContextValues) => boolean;
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

/** What the mock knows of a URL to embed: a video of YouTube or Vimeo, or a web page. */
function defaultEmbed(url: string): EmbedValue | null {
    if (!URL.canParse(url)) {
        return null;
    }
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null;
    }
    const host = parsed.hostname.replace(/^www\./, '');
    const youtube =
        host === 'youtu.be'
            ? parsed.pathname.slice(1)
            : host.endsWith('youtube.com')
              ? parsed.searchParams.get('v')
              : null;
    if (youtube !== null && youtube !== '') {
        return {
            url,
            type: 'video',
            provider: 'YouTube',
            title: `YouTube video ${youtube}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`,
            html: `<iframe src="https://www.youtube.com/embed/${youtube}" width="560" height="315" allowfullscreen></iframe>`,
            width: 560,
            height: 315,
        };
    }
    if (host === 'vimeo.com') {
        const id = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
        return {
            url,
            type: 'video',
            provider: 'Vimeo',
            title: `Vimeo video ${id}`,
            html: `<iframe src="https://player.vimeo.com/video/${id}" width="640" height="360" allowfullscreen></iframe>`,
            width: 640,
            height: 360,
        };
    }
    return { url, type: 'link', provider: host, title: host };
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
 * Whether an item allows an action, as clients read its abilities (decision 0040): a built-in item
 * action needs its ability (`delete`, `duplicate`…), and another action its id.
 */
function allows(item: Item, actionId: string): boolean {
    const ability = isBuiltInItemAction(actionId) ? ITEM_ACTION_ABILITIES[actionId] : actionId;
    return item.abilities[ability] === true && item.abilities[actionId] !== false;
}

/**
 * An in-memory backend that implements the protocol's resource routes: definition, list, show,
 * create, update (with `If-Match`), delete, duplicate and the built-in `delete` action. Its items
 * allow every built-in item action (`view`, `update`, `duplicate`, `delete`). Values are checked
 * with the portable rules. Used to test the conformance kit, and to develop frontends without a
 * real backend.
 */
export function createMockBackend(options: MockBackendOptions): MockBackend {
    const { definition, items = {} } = options;
    const store = new Map<string, Item[]>();
    let nextId = 1;

    const abilitiesFor = (resource: ResourceInput) =>
        Object.fromEntries([
            ['view', true],
            ['update', true],
            ['duplicate', true],
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
    const search = (
        params: URLSearchParams,
        inScope: (resource: string, list: Item[]) => Item[],
    ): Response => {
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
            const found = applyQuery(inScope(id, store.get(id) ?? []), { q });
            const items = found.slice(0, Math.min(limit, left));
            left -= items.length;
            return items.length > 0 ? [{ resource: id, items, total: found.length }] : [];
        });
        return json(200, { data } satisfies SearchResponse);
    };

    const params = definition.context?.params ?? [];
    const names = params.map(({ name }) => name);
    const choicesOf = (name: string, values: ContextValues): ContextOption[] => {
        const param = params.find((candidate) => candidate.name === name);
        return (
            param?.options ??
            options.context?.options?.(name, contextBefore(values, names, name)) ??
            []
        );
    };
    /**
     * The values of the header that the definition declares, each one checked against its
     * choices, in order: a value that isn't one is a `403` problem with its `param`.
     */
    const readContext = (header: string | null): ContextValues | Response => {
        const sent = parseContextHeader(header);
        const values: Record<string, string> = {};
        for (const name of names) {
            const value = sent[name];
            if (value === undefined) {
                continue;
            }
            if (!choicesOf(name, values).some((choice) => choice.value === value)) {
                return problem(403, 'This value of the context can’t be used.', {
                    type: CONTEXT_PROBLEM_TYPE,
                    param: name,
                });
            }
            values[name] = value;
        }
        return values;
    };
    /** The definition for the values of the context: the `value` and `valueLabel` of each param. */
    const definitionFor = (values: ContextValues): DefinitionInput =>
        definition.context === undefined
            ? definition
            : {
                  ...definition,
                  context: {
                      ...definition.context,
                      params: params.map((param) => {
                          const value = values[param.name] ?? null;
                          const label =
                              value !== null
                                  ? choicesOf(param.name, values).find(
                                        (choice) => choice.value === value,
                                    )?.label
                                  : undefined;
                          return { ...param, value, valueLabel: label ?? null };
                      }),
                  },
              };

    const handle = async (request: Request): Promise<Response> => {
        const response = await answer(request);
        if (definition.context !== undefined) {
            response.headers.set('Vary', CONTEXT_HEADER);
        }
        return response;
    };

    const answer = async (request: Request): Promise<Response> => {
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

        const context = readContext(request.headers.get(CONTEXT_HEADER));
        if (context instanceof Response) {
            return context;
        }
        const inScope = (resource: string, list: Item[]): Item[] => {
            const scope = options.context?.scope;
            return scope !== undefined
                ? list.filter((item) => scope(resource, item, context))
                : list;
        };

        if (segments.length === 1 && segments[0] === 'definition' && method === 'GET') {
            return json(200, definitionFor(context));
        }
        if (
            segments.length === 3 &&
            segments[0] === 'context' &&
            segments[2] === 'options' &&
            method === 'GET'
        ) {
            const name = segments[1] ?? '';
            if (!names.includes(name)) {
                return problem(404, 'The context has no such param.');
            }
            const q = (url.searchParams.get('q') ?? '').trim().toLocaleLowerCase();
            const data = choicesOf(name, context)
                .filter((choice) => choice.label.toLocaleLowerCase().includes(q))
                .slice(0, 20);
            return json(200, { data });
        }
        if (segments.length === 1 && segments[0] === 'embeds' && method === 'GET') {
            const url = new URL(request.url, 'http://panneau.test').searchParams.get('url') ?? '';
            const embed = url === '' ? null : (options.embed ?? defaultEmbed)(url);
            return embed !== null
                ? json(200, { data: embed })
                : problem(422, 'The given data was invalid.', {
                      type: 'urn:panneau:problem:validation',
                      errors: { url: ['This URL can’t be embedded.'] },
                  });
        }
        if (segments.length === 1 && segments[0] === 'search' && method === 'GET') {
            return search(url.searchParams, inScope);
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
        // The items in the context: those that requests read and act on
        const scoped = inScope(resource.id, list);

        if (segments.length === 2) {
            if (method === 'GET') {
                const query = fromSearchParams(url.searchParams);
                const perPage = query.perPage ?? resource.list?.perPage ?? 20;
                const page = query.page ?? 1;
                const sort = query.sort ?? resource.list?.defaultSort?.split(',');
                const matching = applyQuery(scoped, {
                    ...query,
                    ...(sort !== undefined ? { sort } : {}),
                });
                if (resource.list?.pagination === 'cursor') {
                    // Cursors are opaque to clients: here, the offset of the page.
                    const cursor = query.cursor ?? 'o0';
                    if (!/^o\d+$/.test(cursor)) {
                        return problem(422, 'The cursor is invalid.', {
                            errors: { cursor: ['The cursor is invalid.'] },
                        });
                    }
                    const offset = Number(cursor.slice(1));
                    const end = offset + perPage;
                    return json(200, {
                        data: matching.slice(offset, end),
                        meta: {
                            perPage,
                            nextCursor: end < matching.length ? `o${String(end)}` : null,
                            previousCursor:
                                offset - perPage > 0 ? `o${String(offset - perPage)}` : null,
                        },
                    });
                }
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
                // The built-in `delete` answers dry runs, declared or not
                if (action?.dryRun !== true && actionId !== 'delete') {
                    return problem(400, 'This action does not support dry runs.');
                }
                const selected = selectItems(scoped, body.selection as Selection | undefined);
                const allowed = selected.filter((item) => allows(item, actionId));
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
            const selection = body.selection as Selection | undefined;
            const selected = selectItems(scoped, selection);
            const deleted = selected.filter((item) => allows(item, 'delete'));
            const skipped = selected.filter((item) => !deleted.includes(item));
            // The only item of an item action is an error, not a skipped result
            const ids =
                selection !== undefined && 'ids' in selection && Array.isArray(selection.ids)
                    ? selection.ids
                    : null;
            if (ids?.length === 1 && skipped.length > 0) {
                return problem(403, 'This item can’t be deleted.');
            }
            store.set(
                resource.id,
                list.filter((item) => !deleted.includes(item)),
            );
            const result: ActionResult = {
                message: `${deleted.length} deleted.`,
                summary: { succeeded: deleted.length, failed: 0, skipped: skipped.length },
                ...(skipped.length > 0
                    ? {
                          results: skipped.slice(0, 20).map((item) => ({
                              id: item.id,
                              status: 'skipped' as const,
                              reason: 'forbidden',
                          })),
                      }
                    : {}),
                refresh: 'list',
            };
            return json(200, result);
        }

        if (segments.length === 4 && segments[3] === 'duplicate' && segments[2] !== undefined) {
            const current = scoped.find((item) => item.id === segments[2]);
            if (current === undefined) {
                return problem(404, 'Item not found.');
            }
            if (method !== 'POST') {
                return problem(405, 'Method not allowed.');
            }
            if (!allows(current, 'duplicate')) {
                return problem(403, 'This item can’t be duplicated.');
            }
            // A copy of its values, under an id no item has
            const { id: _id, version: _version, abilities: _abilities, ...values } = current;
            let copyId = String(nextId++);
            while (list.some((item) => item.id === copyId)) {
                copyId = String(nextId++);
            }
            const copy = makeItem(resource, { ...values, id: copyId });
            list.push(copy);
            return json(201, { data: copy }, etag(copy));
        }

        if (segments.length === 4 && segments[3] === 'preview' && segments[2] !== undefined) {
            const current = scoped.find((item) => item.id === segments[2]);
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
        const index = scoped.some((item) => item.id === id)
            ? list.findIndex((item) => item.id === id)
            : -1;
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
