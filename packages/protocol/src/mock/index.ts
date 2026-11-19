import { CONTEXT_HEADER } from '../constants';
import type { Item } from '../schemas/api';
import { isRecord } from '../values';
import { answerAction } from './actions';
import { answerAggregate } from './aggregates';
import { createMockContext } from './context';
import { json, problem } from './http';
import { defaultEmbed } from './items';
import {
    answerDuplicate,
    answerFieldCheck,
    answerItem,
    answerList,
    answerPreview,
} from './resources';
import type { MockRoute } from './route';
import { createMockSearch } from './search';
import { createMockState } from './state';
import type { MockBackend, MockBackendOptions, Values } from './types';
import { createMockUploads } from './uploads';
import { createMockWidgets } from './widgets';

/**
 * An in-memory backend that implements the protocol's resource routes: definition, list, show,
 * create, update (with `If-Match`), delete, duplicate and the built-in `delete` action. A resource
 * that declares its `delete` `undoable` has a trash: the result of `delete` says how to undo it,
 * and the built-in `restore` puts the items back (decision 0063). Its items
 * allow every built-in item action (`view`, `update`, `duplicate`, `delete`), unless an item of
 * `items` gives its own `abilities`. It reads abilities as clients do (decision 0046): a resource
 * without `viewAny` answers `403` on its list, one without `create` on creates, an item without
 * `view`, `update` or `delete` on those requests; items leave out the values of fields with
 * `view: false`, and writes ignore those of fields with `update: false`. A resource with `types`
 * needs the `type` of a new item, among the types it can create, and its items have the fields of
 * their type (decision 0077). A list with `aggregates` answers
 * `GET /resources/{resource}/aggregate` with `aggregateItems()` (decision 0084). Values are checked
 * with the portable rules. Used to test the conformance kit, and to develop frontends without a
 * real backend.
 */
export function createMockBackend(options: MockBackendOptions): MockBackend {
    const state = createMockState(options);
    const { definition, auth, store, basePath } = state;
    const { handleUploads, resolveValues } = createMockUploads(state);
    const { search } = createMockSearch(state);
    const { names, choicesOf, readContext, definitionFor } = createMockContext(state);
    const { answerWidget } = createMockWidgets(state, definitionFor);

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

        if (auth !== null) {
            if (segments[0] === 'auth') {
                return auth.answer(segments.slice(1), method, readBody, url);
            }
            const account =
                segments[0] === 'account'
                    ? auth.account(segments.slice(1), method, readBody)
                    : null;
            if (account !== null) {
                return account;
            }
            const refused = auth.refuse();
            if (refused !== null) {
                return refused;
            }
        }

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
            const built = definitionFor(context);
            return json(200, auth !== null ? { ...built, user: auth.user() } : built);
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
        if (
            segments.length === 3 &&
            segments[0] === 'dashboard' &&
            segments[1] === 'widgets' &&
            method === 'GET'
        ) {
            return answerWidget(segments[2] ?? '', url.searchParams, context, inScope);
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

        const route: MockRoute = {
            url,
            segments,
            method,
            readBody,
            context,
            inScope,
            resource,
            list,
            scoped,
            request,
        };
        const files = { resolveValues };
        return (
            (await answerAggregate(state, route)) ??
            (await answerList(state, route, files)) ??
            (await answerFieldCheck(state, route)) ??
            (await answerAction(state, route)) ??
            (await answerDuplicate(state, route)) ??
            (await answerPreview(state, route)) ??
            answerItem(state, route, files)
        );
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
export type { MockAuthOptions, MockMail, MockUser } from './auth';
export type {
    MockBackend,
    MockBackendOptions,
    MockContextOptions,
    MockWidget,
    MockWidgetContext,
} from './types';
