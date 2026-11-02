import { type ActionOutcome, type ActionTarget, useActionRunner } from '@panneau/actions';
import { useLeaveGuards } from '@panneau/core';
import { useDataAdapter, useDuplicateItem } from '@panneau/data/query';
import { actionsMessages } from '@panneau/intl';
import type { Action, ActionPlacement, Resource } from '@panneau/protocol';
import { usePanneauIntl, useToast } from '@panneau/ui';

import { navigate } from '../location';
import { routePath } from '../routes';
import { getItemTitle } from './itemTitle';

/** Whether an action is the built-in `duplicate`, which the resource doesn't replace. */
function isBuiltInDuplicate(resource: Resource, action: Action): boolean {
    return (
        action.id === 'duplicate' &&
        !(resource.actions ?? []).some((declared) => declared.id === 'duplicate')
    );
}

/**
 * Runs the actions of a resource's items (decision 0040): the built-in `duplicate` copies the item
 * through the adapter (`duplicate()`), then opens the copy in its form, or in its panel when it
 * can't be updated. Every other action goes to the action runner. `isSupported()` leaves out the
 * built-in `duplicate` when the adapter can't duplicate.
 */
export function useItemActionRunner(
    resource: Resource,
    { basePath, locale }: { basePath: string; locale: string },
): {
    run: (target: ActionTarget) => Promise<ActionOutcome | false>;
    isSupported: (action: Action) => boolean;
} {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const adapter = useDataAdapter();
    const guards = useLeaveGuards();
    const runAction = useActionRunner(resource.id);
    const duplicate = useDuplicateItem(resource.id);

    const run = async (target: ActionTarget): Promise<ActionOutcome | false> => {
        const { action, item } = target;
        if (!isBuiltInDuplicate(resource, action) || item === undefined) {
            return runAction(target);
        }
        const copy = await duplicate.mutateAsync(item.id);
        toasts.show({
            title: intl.formatMessage(actionsMessages.duplicated, {
                title: getItemTitle(copy, resource.itemTitle, locale) ?? copy.id,
            }),
            tone: 'success',
        });
        const to = routePath(
            {
                name: copy.abilities.update === true ? 'resource.edit' : 'resource.show',
                resource: resource.id,
                id: copy.id,
            },
            basePath,
        );
        // Like a link: a form with unsaved changes asks first.
        if ((await guards?.confirmLeave()) ?? true) {
            navigate(to);
        }
        return { status: 'navigated', to };
    };

    return {
        run,
        isSupported: (action) =>
            !isBuiltInDuplicate(resource, action) || adapter.duplicate !== undefined,
    };
}

/** Actions grouped by placement, without those `isSupported()` leaves out. */
export function filterActions(
    actions: Record<ActionPlacement, Action[]>,
    isSupported: (action: Action) => boolean,
): Record<ActionPlacement, Action[]> {
    return {
        row: actions.row.filter(isSupported),
        toolbar: actions.toolbar.filter(isSupported),
        form: actions.form.filter(isSupported),
        menu: actions.menu.filter(isSupported),
    };
}
