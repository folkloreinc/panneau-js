import type { Definition, Resource } from '../schemas';
import { ActionResult } from '../schemas/api';
import { type Check } from './check';
import { type ConformanceRun, getResourcePath, listItems as listItemsOf } from './run';

/**
 * The abilities of the definition and of the items, and what the API answers (decision 0046).
 */
export async function checkAbilities(ctx: ConformanceRun): Promise<void> {
    const { request, run } = ctx;
    const { definition, resource } = ctx.state;
    const resourcePath = () => getResourcePath(resource);
    const listItems = (check: Check) => listItemsOf(ctx, check);

    // The API agrees with the abilities of the definition and of the items (decision 0046).

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
}
