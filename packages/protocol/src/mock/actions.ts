// The actions of a mock backend: built-in and declared ones, dry runs and undo (decision 0063).
import { UNDO_LIMIT } from '../constants';
import type { ActionResult, Item, Selection } from '../schemas/api';
import type { Resource } from '../schemas/resource';
import { json, problem } from './http';
import { allows } from './items';
import type { MockRoute } from './route';
import type { MockState } from './state';

/**
 * What a delete says, as a backend should write it (decision 0062): the item by its title, or the
 * resource's labels with the count: "“Spring contest” deleted.", "Article deleted.", "3 articles
 * deleted.". Nothing when nothing was deleted: the client explains the skipped items.
 */
function describeDeleted(
    resource: Pick<Resource, 'label' | 'itemTitle'>,
    deleted: readonly Item[],
): string | undefined {
    const [only] = deleted;
    if (only === undefined) {
        return undefined;
    }
    if (deleted.length > 1) {
        return `${deleted.length} ${resource.label.plural} deleted.`;
    }
    const value = resource.itemTitle !== undefined ? only[resource.itemTitle] : undefined;
    const title =
        typeof value === 'string'
            ? value
            : value !== null && typeof value === 'object'
              ? Object.values(value as Record<string, unknown>).find(
                    (localized): localized is string => typeof localized === 'string',
                )
              : undefined;
    if (title !== undefined && title !== '') {
        return `“${title}” deleted.`;
    }
    const singular = resource.label.singular;
    return `${singular.charAt(0).toLocaleUpperCase('en')}${singular.slice(1)} deleted.`;
}

/**
 * `POST /resources/{resource}/actions/{action}`: built-in and declared actions, their dry runs and
 * their undo.
 */
export async function answerAction(state: MockState, route: MockRoute): Promise<Response | null> {
    const { options, store, trash, selectItems } = state;
    const { segments, method, readBody, resource, list, scoped } = route;
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
        // A resource with a trash declares its delete undoable, and restores what it deleted.
        const hasTrash = (resource.actions ?? []).some(
            (candidate) => candidate.id === 'delete' && candidate.undoable === true,
        );
        if (actionId === 'restore' && hasTrash) {
            const selection = body.selection as Selection | undefined;
            const ids =
                selection !== undefined && 'ids' in selection && Array.isArray(selection.ids)
                    ? selection.ids.map(String)
                    : null;
            if (ids === null) {
                return problem(422, 'The selection needs ids.', {
                    type: 'urn:panneau:problem:validation',
                    errors: { selection: ['The selection needs ids.'] },
                });
            }
            const deleted = trash.get(resource.id) ?? [];
            const restored = deleted.filter((item) => ids.includes(item.id));
            const missing = ids.filter((id) => !restored.some((item) => item.id === id));
            if (ids.length === 1 && missing.length === 1) {
                return problem(404, 'Item not found.');
            }
            trash.set(
                resource.id,
                deleted.filter((item) => !restored.includes(item)),
            );
            store.set(resource.id, [...list, ...restored]);
            const result: ActionResult = {
                summary: { succeeded: restored.length, failed: 0, skipped: missing.length },
                ...(missing.length > 0
                    ? {
                          results: missing.map((id) => ({
                              id,
                              status: 'skipped' as const,
                              reason: 'not_found',
                          })),
                      }
                    : {}),
                refresh: 'list',
            };
            return json(200, result);
        }
        if (actionId !== 'delete') {
            return problem(404, 'Action not found.');
        }
        const selection = body.selection as Selection | undefined;
        const selected = selectItems(scoped, selection);
        const allowed = selected.filter((item) => allows(item, 'delete'));
        const skipped = selected.filter((item) => !allowed.includes(item));
        // An item that something else uses is skipped, even alone: it isn't an error.
        const inUse = allowed.filter(
            (item) => options.inUse?.({ resource: resource.id, item }) === true,
        );
        const deleted = allowed.filter((item) => !inUse.includes(item));
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
        if (hasTrash) {
            trash.set(resource.id, [...(trash.get(resource.id) ?? []), ...deleted]);
        }
        const message = describeDeleted(resource, deleted);
        const result: ActionResult = {
            ...(message !== undefined ? { message } : {}),
            // What was deleted can be put back, up to the limit of the protocol.
            ...(hasTrash && deleted.length > 0 && deleted.length <= UNDO_LIMIT
                ? { undo: { action: 'restore', items: deleted.map((item) => item.id) } }
                : {}),
            summary: {
                succeeded: deleted.length,
                failed: 0,
                skipped: skipped.length + inUse.length,
            },
            ...(skipped.length + inUse.length > 0
                ? {
                      results: [
                          ...skipped.map((item) => ({
                              id: item.id,
                              status: 'skipped' as const,
                              reason: 'forbidden',
                          })),
                          ...inUse.map((item) => ({
                              id: item.id,
                              status: 'skipped' as const,
                              reason: 'in_use',
                          })),
                      ].slice(0, 20),
                  }
                : {}),
            refresh: 'list',
        };
        return json(200, result);
    }
    return null;
}
