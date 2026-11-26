import { useState } from 'react';

import { type ActionOutcome, type ActionTarget, useActionRunner } from '@panneau/actions';
import { type ItemAction, asksConfirmation, usePanneau } from '@panneau/core';
import { actionsMessages, getActionLabel, listsMessages } from '@panneau/intl';
import { ActionButton, ConfirmDialog, type ListActionEvent } from '@panneau/lists';
import type { Action, Item } from '@panneau/protocol';
import { usePanneauIntl, useToast } from '@panneau/ui';

import { usePublishItemActions } from '../currentPage';
import { getItemTitle } from './itemTitle';

export interface ItemActionsProps {
    /** The id of the resource. */
    resource: string;
    /**
     * The actions of the item on this surface, with their links: `getItemActions()` of
     * `@panneau/core`, as rows and their menu show them.
     */
    actions: readonly ItemAction[];
    item: Item;
    /** Runs an action, in place of the action runner: the app's, which also duplicates items. */
    runAction?: (target: ActionTarget) => Promise<ActionOutcome | false>;
    /** Called once an action has run, has been queued or has navigated. */
    onRun?: (action: Action, outcome: ActionOutcome) => void;
}

/**
 * The actions of an item in the header of its panel or of its edit page (decision 0040), those
 * that destroy last and outlined (decision 0088). Links are links, in a new tab when they leave the
 * admin. Other actions run through the action runner (parameters, results, queued runs), after a
 * confirmation when they ask for one. The confirmation and the toast of a failure name the item by
 * its title (decision 0062).
 */
export function ItemActions({
    resource,
    actions,
    item,
    runAction: runActionProp,
    onRun,
}: ItemActionsProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const runner = useActionRunner(resource);
    const runAction = runActionProp ?? runner;
    const [pending, setPending] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<ListActionEvent | null>(null);
    const { definition } = usePanneau();
    // The title in the locale of the content, as the header of the item shows it
    const resources = definition?.resources ?? [];
    const itemTitle = resources.find((candidate) => candidate.id === resource)?.itemTitle;
    const locale = definition !== null ? definition.locale : intl.locale;
    const title = getItemTitle(item, itemTitle, locale) ?? '';
    const subject =
        title !== '' ? intl.formatMessage(actionsMessages.subjectItem, { title }) : null;
    const execute = async (action: Action) => {
        setConfirming(null);
        setPending(action.id);
        // A promise chain rather than `try`, which the React Compiler only handles in part.
        await Promise.resolve()
            .then(() => runAction({ action, scope: 'item', item, count: 1 }))
            .then((outcome) => {
                // `false`: the user cancelled its parameters
                if (outcome !== false) {
                    onRun?.(action, outcome);
                }
            })
            .catch((caught: unknown) => {
                const label = getActionLabel(action, intl);
                toasts.show({
                    title:
                        subject !== null
                            ? intl.formatMessage(actionsMessages.failedFor, {
                                  action: label,
                                  subject,
                              })
                            : intl.formatMessage(listsMessages.actionFailed, { action: label }),
                    ...(caught instanceof Error && caught.message !== ''
                        ? { description: caught.message }
                        : {}),
                    tone: 'danger',
                });
            });
        setPending(null);
    };
    const run = (action: Action) => {
        // An undoable action runs at once: "Undo" in its toast replaces the confirmation.
        if (asksConfirmation(action)) {
            setConfirming({ action, scope: 'item', item, count: 1, skipped: [] });
        } else {
            void execute(action);
        }
    };

    // The palette offers them too, run as their buttons run them (decision 0116)
    usePublishItemActions(
        actions.map(({ action, href }) => ({ action, href, run: () => run(action) })),
    );
    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            {[
                ...actions.filter(({ action }) => action.destructive !== true),
                ...actions.filter(({ action }) => action.destructive === true),
            ].map(({ action, href }) => (
                <ActionButton
                    key={action.id}
                    action={action}
                    href={href}
                    size="md"
                    inHeader
                    isPending={pending === action.id}
                    isDisabled={pending !== null && pending !== action.id}
                    onPress={() => run(action)}
                />
            ))}
            <ConfirmDialog
                event={confirming}
                itemLabel={title !== '' ? title : undefined}
                onConfirm={(event) => void execute(event.action)}
                onCancel={() => setConfirming(null)}
            />
        </>
    );
}
