import { getLinkTypes } from '../links';
import type { Definition, Resource } from '../schemas';
import { ActionResult, ItemResponse } from '../schemas/api';
import { isEqual } from '../values';
import { type Check, normalizeEtag } from './check';
import { type ConformanceRun, getResourcePath, listItems as listItemsOf } from './run';

/**
 * The checks that write data, with `writes`: create, update, conflicts, duplicates, the undo of an
 * action, and delete.
 */
export async function checkWrites(ctx: ConformanceRun): Promise<void> {
    const { options, request, run } = ctx;
    const { definition, resource } = ctx.state;
    const resourcePath = () => getResourcePath(resource);
    const listItems = (check: Check) => listItemsOf(ctx, check);

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

    await run(
        'create.implied-rules',
        'A reversed date range and an invalid amount are refused with a 422 problem',
        async (check) => {
            if (writes === undefined || resource === null) {
                check.skip('Write checks are disabled.');
                return;
            }
            // Values that only the rules implied by their type refuse (decision 0053).
            const cases = resource.fields.flatMap((field): [string, unknown, string][] => {
                if (
                    field.localized === true ||
                    field.readOnly === true ||
                    field.notInForm === true
                ) {
                    return [];
                }
                if (field.type === 'daterange') {
                    const time = field.settings?.time === true;
                    return [
                        [
                            field.name,
                            time
                                ? { start: '2026-11-06T10:00:00Z', end: '2026-11-04T10:00:00Z' }
                                : { start: '2026-11-06', end: '2026-11-04' },
                            'a range that ends before it starts',
                        ],
                    ];
                }
                if (field.type === 'money') {
                    const currencies = field.settings?.currencies;
                    const currency =
                        typeof field.settings?.currency === 'string'
                            ? field.settings.currency
                            : Array.isArray(currencies) && typeof currencies[0] === 'string'
                              ? currencies[0]
                              : 'CAD';
                    return [[field.name, { amount: 12.5, currency }, 'an amount in major units']];
                }
                return [];
            });
            if (cases.length === 0) {
                check.skip('The resource has no daterange or money field.');
                return;
            }
            for (const [name, value, label] of cases) {
                const reply = await request(resourcePath(), {
                    method: 'POST',
                    body: JSON.stringify({ ...writes.create, [name]: value }),
                });
                const failure = check.expectProblem(reply, 422);
                if (failure !== null) {
                    check.expect(
                        Object.keys(failure.errors ?? {}).some(
                            (key) => key === name || key.startsWith(`${name}.`),
                        ),
                        `${name}: ${label} is refused, but not in errors.${name}.`,
                    );
                }
            }
        },
    );

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
                        field.notInForm !== true &&
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
        'update.parts',
        'Addresses and links are refused at the path of their invalid part',
        async (check) => {
            if (createdId === null || writes === undefined || resource === null) {
                check.skip('No item was created.');
                return;
            }
            const editable = resource.fields.filter(
                (field) =>
                    field.readOnly !== true &&
                    field.notInForm !== true &&
                    field.createOnly !== true &&
                    field.localized !== true &&
                    field.abilities?.update !== false &&
                    field.visibleWhen === undefined,
            );
            // A Canadian or an American address with a postal code of the other country
            const address = editable.find((field) => {
                const countries = field.settings?.countries;
                return (
                    field.type === 'address' &&
                    (!Array.isArray(countries) ||
                        countries.includes('CA') ||
                        countries.includes('US'))
                );
            });
            // A link to an email address without `mailto:`, or to a URL that isn't one
            const link = editable.find(
                (field) =>
                    field.type === 'link' &&
                    getLinkTypes(field).some((type) => type.id === 'email' || type.id === 'url'),
            );
            if (address === undefined && link === undefined) {
                check.skip('The resource has no address nor link field.');
                return;
            }
            const values: Record<string, unknown> = {};
            const paths: string[] = [];
            if (address !== undefined) {
                const countries = address.settings?.countries;
                const canada = !Array.isArray(countries) || countries.includes('CA');
                values[address.name] = {
                    street: '1234 Main Street',
                    city: canada ? 'Montreal' : 'Springfield',
                    region: canada ? 'QC' : 'IL',
                    postalCode: canada ? '12345' : 'H2X 1Y4',
                    country: canada ? 'CA' : 'US',
                };
                paths.push(`${address.name}.postalCode`);
            }
            if (link !== undefined) {
                const email = getLinkTypes(link).some((type) => type.id === 'email');
                values[link.name] = email
                    ? { type: 'email', url: 'info@example.com', newTab: false }
                    : { type: 'url', url: 'example', newTab: false };
                paths.push(`${link.name}.url`);
            }
            // The current version: earlier checks may have updated the item
            const current = await request(itemPath());
            const item = check.expectStatus(current, 200)
                ? check.expectSchema(ItemResponse, current.body, 'The item')
                : null;
            if (item === null) {
                return;
            }
            const version = item.data.version;
            const reply = await request(itemPath(), {
                method: 'PATCH',
                body: JSON.stringify(values),
                headers: version !== null ? { 'If-Match': `"${version}"` } : {},
            });
            const failure = check.expectProblem(reply, 422);
            if (failure !== null) {
                const missing = paths.filter((path) => failure.errors?.[path] === undefined);
                check.expect(
                    missing.length === 0,
                    `The 422 problem has no errors at ${missing.join(', ')}: ${Object.keys(failure.errors ?? {}).join(', ') || 'none'}.`,
                );
            }
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
                        field.notInForm !== true &&
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
        'update.not-in-form',
        'An update ignores the values of the fields that forms leave out',
        async (check) => {
            if (createdId === null || writes === undefined || resource === null) {
                check.skip('No item was created.');
                return;
            }
            // A field that only items give, such as the URL of a page (decision 0071).
            const names = resource.fields
                .filter((field) => field.notInForm === true && field.abilities?.view !== false)
                .map((field) => field.name);
            if (names.length === 0) {
                check.skip('The resource has no field with `notInForm`.');
                return;
            }
            const current = await request(itemPath());
            const before = check.expectStatus(current, 200)
                ? check.expectSchema(ItemResponse, current.body, 'The item')
                : null;
            if (before === null) {
                return;
            }
            const version = before.data.version;
            const reply = await request(itemPath(), {
                method: 'PATCH',
                body: JSON.stringify(
                    Object.fromEntries(names.map((name) => [name, '__panneau_conformance__'])),
                ),
                headers: version !== null ? { 'If-Match': `"${version}"` } : {},
            });
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const after = check.expectSchema(ItemResponse, reply.body, 'The updated item');
            if (after === null) {
                return;
            }
            const changed = names.filter((name) => !isEqual(before.data[name], after.data[name]));
            check.expect(
                changed.length === 0,
                `An update changed ${changed.join(', ')}, which forms leave out.`,
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

    await run(
        'action.undo',
        'The undo of an undoable action runs, and puts the item back',
        async (check) => {
            const current = resource as Resource | null;
            if (current === null) {
                check.skip('No resource to test.');
                return;
            }
            if (createdId === null) {
                check.skip('No item was created.');
                return;
            }
            // The delete of a trash, or an action of the resource that needs no parameters
            const declared = current.actions ?? [];
            const action =
                declared.find(
                    (candidate) => candidate.id === 'delete' && candidate.undoable === true,
                ) ??
                declared.find(
                    (candidate) =>
                        candidate.undoable === true &&
                        (candidate.kind ?? 'server') === 'server' &&
                        candidate.queued !== true &&
                        (candidate.fields ?? []).length === 0 &&
                        candidate.scope.some((scope) => scope === 'item' || scope === 'selection'),
                );
            if (action === undefined) {
                check.skip('The resource has no undoable action without parameters.');
                return;
            }
            const before = await request(itemPath());
            const item = check.expectStatus(before, 200)
                ? check.expectSchema(ItemResponse, before.body, 'The item')
                : null;
            if (item === null) {
                return;
            }
            const reply = await request(
                `${resourcePath()}/actions/${encodeURIComponent(action.id)}`,
                { method: 'POST', body: JSON.stringify({ selection: { ids: [createdId] } }) },
            );
            if (!check.expectStatus(reply, 200)) {
                return;
            }
            const result = check.expectSchema(
                ActionResult,
                reply.body,
                `The result of \`${action.id}\``,
            );
            const undo = result?.undo;
            if (
                !check.expect(
                    undo !== undefined && undo.items.includes(createdId),
                    `The result of the undoable \`${action.id}\` has no \`undo\` with the item it changed.`,
                ) ||
                undo === undefined
            ) {
                return;
            }
            const undone = await request(
                `${resourcePath()}/actions/${encodeURIComponent(undo.action)}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        selection: { ids: undo.items },
                        values: undo.params ?? {},
                    }),
                },
            );
            if (!check.expectStatus(undone, 200)) {
                return;
            }
            const after = await request(itemPath());
            if (!check.expect(after.status === 200, 'After the undo, the item is not back.')) {
                return;
            }
            const restored = check.expectSchema(
                ItemResponse,
                after.body,
                'The item after the undo',
            );
            if (restored === null) {
                return;
            }
            current.fields.forEach((field) => {
                check.expect(
                    isEqual(restored.data[field.name], item.data[field.name]),
                    `After the undo, \`${field.name}\` is ${JSON.stringify(restored.data[field.name])}, not ${JSON.stringify(item.data[field.name])}.`,
                );
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
}
