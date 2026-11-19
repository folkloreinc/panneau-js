import { IDS_FILTER, MAX_PER_PAGE } from '../constants';
import { getItemImageField } from '../libraries';
import { type FilterRange, isCursorPage, toSearchParams } from '../query';
import type { Definition, Resource } from '../schemas';
import {
    ActionResult,
    FieldCheckResponse,
    ItemResponse,
    ListResponse,
    UploadSignResponse,
} from '../schemas/api';
import { isFilled } from '../values';
import { UNKNOWN, normalizeEtag } from './check';
import { type ConformanceRun, getResourcePath } from './run';

/**
 * The lists and the items of the tested resource: pages, sorts, filters, the fields of a list,
 * cursors, uploads, checks of fields, and missing items.
 */
export async function checkLists(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition, resource } = ctx.state;
    const resourcePath = () => getResourcePath(resource);
    let firstItemId: string | null = null;

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
        'list.filter-ids',
        'GET /resources/{resource} filters on the ids of items (filter[ids])',
        async (check) => {
            if (resource === null) {
                check.skip('No resource to test.');
                return;
            }
            const first = await request(`${resourcePath()}?perPage=3`);
            if (!check.expectStatus(first, 200)) {
                return;
            }
            const page = check.expectSchema(ListResponse, first.body, 'The list');
            const items = page?.data ?? [];
            if (items.length < 2) {
                check.skip('The list has fewer than 2 items.');
                return;
            }
            // Two items of the first page, in reverse, and an id that no item has.
            const wanted = items.slice(0, 2).map((item) => item.id);
            const ids = [...wanted].reverse().concat('panneau-conformance-missing');
            const reply = await request(
                `${resourcePath()}?${toSearchParams({ filter: { [IDS_FILTER]: ids } })}`,
            );
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const filtered = check.expectSchema(
                ListResponse,
                reply.body,
                'The list filtered on ids',
            );
            if (filtered === null) {
                return;
            }
            const got = filtered.data.map((item) => item.id);
            check.expect(
                got.length === wanted.length && wanted.every((id) => got.includes(id)),
                `filter[ids][] of ${wanted.join(', ')} listed ${got.length > 0 ? got.join(', ') : 'no items'}.`,
            );
        },
    );

    await run('list.per-page', 'GET /resources/{resource} caps perPage at 100', async (check) => {
        if (resource === null) {
            check.skip('No resource to test.');
            return;
        }
        const reply = await request(`${resourcePath()}?perPage=${MAX_PER_PAGE + 1}`);
        if (!check.expectStatus(reply, 200)) {
            return;
        }
        const list = check.expectSchema(ListResponse, reply.body, 'The list');
        if (list === null) {
            return;
        }
        check.expect(
            list.meta.perPage <= MAX_PER_PAGE && list.data.length <= MAX_PER_PAGE,
            `perPage=${MAX_PER_PAGE + 1} answered meta.perPage ${list.meta.perPage} and ${list.data.length} items, more than ${MAX_PER_PAGE}.`,
        );
    });

    await run(
        'list.fields',
        'GET /resources/{resource} gives the fields asked for only (fields)',
        async (check) => {
            const fields = (resource as Resource | null)?.fields ?? [];
            // A backend can also give the title and the image of items, which lists show
            const allowed = new Set(
                [
                    (resource as Resource | null)?.itemTitle,
                    resource !== null ? getItemImageField(resource as Resource) : undefined,
                ].filter((name): name is string => name !== undefined),
            );
            const asked = fields.find((field) => !allowed.has(field.name))?.name;
            const others = fields
                .map((field) => field.name)
                .filter((name) => name !== asked && !allowed.has(name));
            if (resource === null || asked === undefined || others.length === 0) {
                check.skip(
                    'The resource has no 2 fields besides the title and the image of items.',
                );
                return;
            }
            const reply = await request(
                `${resourcePath()}?${toSearchParams({ perPage: 5, fields: [asked] })}`,
            );
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            // Items still have their id, version and abilities
            const list = check.expectSchema(ListResponse, reply.body, 'The list with fields');
            const extra = [
                ...new Set(
                    (list?.data ?? []).flatMap((item) => others.filter((name) => name in item)),
                ),
            ];
            check.expect(
                extra.length === 0,
                `fields=${asked} also gave the values of ${extra.join(', ')}.`,
            );
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
}
