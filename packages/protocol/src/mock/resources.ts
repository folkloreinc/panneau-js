// The routes of the lists and the items of a mock backend.
import { MAX_PER_PAGE } from '../constants';
import { fromSearchParams } from '../query';
import { ITEM_TYPE_KEY, getResourceType, hasResourceTypes } from '../resourceTypes';
import type { FieldCheckResponse, Item, PreviewResponse } from '../schemas/api';
import { isRecord } from '../values';
import { etag, json, parseEtag, problem } from './http';
import {
    RESERVED_KEYS,
    allows,
    applyQuery,
    defaultPreviewUrl,
    pickFields,
    withOwnTransform,
    withTypeFields,
    writableValues,
} from './items';
import type { MockFiles, MockRoute } from './route';
import type { MockState } from './state';

/** `GET` and `POST /resources/{resource}`: a page of items, and a new item. */
export async function answerList(
    state: MockState,
    route: MockRoute,
    files: MockFiles,
): Promise<Response | null> {
    const { makeItem, present, validationProblem } = state;
    const { url, segments, method, readBody, resource, list, scoped } = route;
    const { resolveValues } = files;
    if (segments.length === 2) {
        if (method === 'GET') {
            if (resource.abilities?.viewAny === false) {
                return problem(403, 'This resource can’t be listed.');
            }
            const query = fromSearchParams(url.searchParams);
            // A page has at most 100 items, whatever it asks for.
            const perPage = Math.min(query.perPage ?? resource.list?.perPage ?? 20, MAX_PER_PAGE);
            const page = query.page ?? 1;
            // Items with the fields asked for only, and what every item has
            const show = (item: Item) =>
                pickFields(resource, present(resource, item), query.fields);
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
                    data: matching.slice(offset, end).map(show),
                    meta: {
                        perPage,
                        nextCursor: end < matching.length ? `o${String(end)}` : null,
                        previousCursor:
                            offset - perPage > 0 ? `o${String(offset - perPage)}` : null,
                    },
                });
            }
            return json(200, {
                data: matching.slice((page - 1) * perPage, page * perPage).map(show),
                meta: {
                    page,
                    perPage,
                    total: matching.length,
                    lastPage: Math.max(1, Math.ceil(matching.length / perPage)),
                },
            });
        }
        if (method === 'POST') {
            if (resource.abilities?.create === false) {
                return problem(403, 'Items of this resource can’t be created.');
            }
            const raw = await readBody();
            // A resource with types: the body says the type of the new item (decision 0077).
            const typed = hasResourceTypes(resource);
            const type = typed ? getResourceType(resource, raw[ITEM_TYPE_KEY]) : undefined;
            if (typed && type === undefined) {
                return problem(422, 'The given data was invalid.', {
                    type: 'urn:panneau:problem:validation',
                    errors: { [ITEM_TYPE_KEY]: ['The type is not a type of this resource.'] },
                });
            }
            if (type?.abilities?.create === false) {
                return problem(403, 'Items of this type can’t be created.');
            }
            const ofType = withTypeFields(resource, type?.id);
            const body = writableValues(ofType, raw);
            const invalid = validationProblem(ofType, body, 'create');
            if (invalid !== null) {
                return invalid;
            }
            const { values, problem: unresolved } = resolveValues(ofType, body);
            if (unresolved !== null) {
                return unresolved;
            }
            const item = withOwnTransform(
                ofType,
                makeItem(resource, {
                    ...values,
                    id: undefined,
                    ...(type !== undefined ? { [ITEM_TYPE_KEY]: type.id } : {}),
                }),
            );
            list.push(item);
            return json(201, { data: present(resource, item) }, etag(item));
        }
        return problem(405, 'Method not allowed.');
    }
    return null;
}

/** `POST /resources/{resource}/fields/{field}/check`: the availability of a value. */
export async function answerFieldCheck(
    state: MockState,
    route: MockRoute,
): Promise<Response | null> {
    const { segments, method, readBody, resource, list } = route;
    if (segments[2] === 'fields' && segments[4] === 'check' && segments.length === 5) {
        if (method !== 'POST') {
            return problem(405, 'Method not allowed.');
        }
        // The fields of the resource, then those of its types
        const field = [
            ...resource.fields,
            ...(resource.types ?? []).flatMap((type) => type.fields),
        ].find((candidate) => candidate.name === segments[3] && candidate.check === true);
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
        const prefix = typeof field.settings?.prefix === 'string' ? field.settings.prefix : null;
        const response: FieldCheckResponse = {
            available,
            suggestion,
            prefix,
            url: prefix !== null ? `${prefix}${body.value}` : null,
        };
        return json(200, response);
    }
    return null;
}

/** `POST /resources/{resource}/{id}/duplicate`. */
export async function answerDuplicate(
    state: MockState,
    route: MockRoute,
): Promise<Response | null> {
    const { freshId, makeItem, present } = state;
    const { segments, method, resource, list, scoped } = route;
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
        const copy = makeItem(resource, { ...values, id: freshId(resource) });
        list.push(copy);
        return json(201, { data: present(resource, copy) }, etag(copy));
    }
    return null;
}

/** `POST /resources/{resource}/{id}/preview`. */
export async function answerPreview(state: MockState, route: MockRoute): Promise<Response | null> {
    const { options } = state;
    const { segments, method, readBody, resource, scoped } = route;
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
    return null;
}

/** `GET`, `PATCH` and `DELETE /resources/{resource}/{id}`. */
export async function answerItem(
    state: MockState,
    route: MockRoute,
    files: MockFiles,
): Promise<Response> {
    const { present, validationProblem } = state;
    const { segments, method, readBody, resource, list, scoped, request } = route;
    const { resolveValues } = files;
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
        if (current.abilities.view !== true) {
            return problem(403, 'This item can’t be viewed.');
        }
        return json(200, { data: present(resource, current) }, etag(current));
    }
    if (method === 'PATCH') {
        if (current.abilities.update !== true) {
            return problem(403, 'This item can’t be updated.');
        }
        const ifMatch = request.headers.get('If-Match');
        if (
            ifMatch !== null &&
            current.version !== null &&
            parseEtag(ifMatch) !== current.version
        ) {
            return problem(412, 'The item was changed by someone else.', {
                type: 'urn:panneau:problem:version-conflict',
                current: present(resource, current),
            });
        }
        // The fields of the item's type; its type stays the one it was created with.
        const ofType = withTypeFields(resource, current[ITEM_TYPE_KEY]);
        const writable = writableValues(ofType, await readBody());
        const body = hasResourceTypes(resource)
            ? Object.fromEntries(Object.entries(writable).filter(([key]) => key !== ITEM_TYPE_KEY))
            : writable;
        const invalid = validationProblem(ofType, body, 'update', current);
        if (invalid !== null) {
            return invalid;
        }
        const { values, problem: unresolved } = resolveValues(ofType, body);
        if (unresolved !== null) {
            return unresolved;
        }
        const updates = Object.fromEntries(
            Object.entries(values).filter(([key]) => !RESERVED_KEYS.has(key)),
        );
        const updated = withOwnTransform(ofType, {
            ...current,
            ...updates,
            version: current.version === null ? null : String(Number(current.version) + 1),
        });
        list[index] = updated;
        return json(200, { data: present(resource, updated) }, etag(updated));
    }
    if (method === 'DELETE') {
        if (current.abilities.delete !== true) {
            return problem(403, 'This item can’t be deleted.');
        }
        list.splice(index, 1);
        return json(204, null);
    }
    return problem(405, 'Method not allowed.');
}
