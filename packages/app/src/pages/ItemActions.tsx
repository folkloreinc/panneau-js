import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-aria-components';

import { type ActionOutcome, type ActionTarget, useActionRunner } from '@panneau/actions';
import type { ItemAction } from '@panneau/core';
import { getActionLabel, listsMessages } from '@panneau/intl';
import { ConfirmDialog, type ListActionEvent, getActionIcon } from '@panneau/lists';
import type { Action, Item } from '@panneau/protocol';
import { Button, Icon, usePanneauIntl, useToast } from '@panneau/ui';

import styles from './pages.module.css';

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

/** Whether a link leaves the admin: it opens in a new tab. */
function isExternal(href: string): boolean {
    return /^https?:\/\//.test(href);
}

/**
 * The actions of an item in the header of its panel or of its edit page (decision 0040). Links
 * are links, in a new tab when they leave the admin. Other actions run through the action runner
 * (parameters, results, queued runs), after a confirmation when they ask for one.
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
    if (actions.length === 0) {
        return null;
    }

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
                toasts.show({
                    title: intl.formatMessage(listsMessages.actionFailed, {
                        action: getActionLabel(action, intl),
                    }),
                    ...(caught instanceof Error && caught.message !== ''
                        ? { description: caught.message }
                        : {}),
                    tone: 'danger',
                });
            });
        setPending(null);
    };
    const run = (action: Action) => {
        if (action.confirm !== undefined && action.confirm !== false) {
            setConfirming({ action, scope: 'item', item, count: 1, skipped: [] });
        } else {
            void execute(action);
        }
    };

    return (
        <>
            {actions.map(({ action, href }) => {
                const label = getActionLabel(action, intl);
                const external = href !== null && isExternal(href);
                const icon = external ? ExternalLink : getActionIcon(action);
                return href !== null ? (
                    <Link
                        key={action.id}
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className={styles.actionLink}
                    >
                        {icon !== undefined ? <Icon icon={icon} size="sm" /> : null}
                        {label}
                    </Link>
                ) : (
                    <Button
                        key={action.id}
                        variant={action.destructive === true ? 'danger' : 'secondary'}
                        {...(icon !== undefined ? { icon } : {})}
                        isPending={pending === action.id}
                        isDisabled={pending !== null && pending !== action.id}
                        onPress={() => run(action)}
                    >
                        {label}
                    </Button>
                );
            })}
            <ConfirmDialog
                event={confirming}
                onConfirm={(event) => void execute(event.action)}
                onCancel={() => setConfirming(null)}
            />
        </>
    );
}
