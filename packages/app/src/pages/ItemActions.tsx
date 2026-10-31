import { useState } from 'react';
import { Link } from 'react-aria-components';

import { type ActionOutcome, useActionRunner } from '@panneau/actions';
import { listsMessages } from '@panneau/intl';
import {
    ConfirmDialog,
    type ListActionEvent,
    getActionHref,
    getActionIcon,
    isAllowedOn,
} from '@panneau/lists';
import type { Action, Item } from '@panneau/protocol';
import { Button, Icon, usePanneauIntl, useToast } from '@panneau/ui';

import styles from './pages.module.css';

export interface ItemActionsProps {
    /** The id of the resource. */
    resource: string;
    /** The actions placed in `form`. Those that don't apply to an item, or to this one, are left out. */
    actions: readonly Action[];
    item: Item;
    /** Called once an action has run, has been queued or has navigated. */
    onRun?: (action: Action, outcome: ActionOutcome) => void;
}

/**
 * The actions of an item in the header of its edit page: those placed in `form`, that the item
 * allows. They run through the action runner (parameters, results, queued runs), after a
 * confirmation when they ask for one. A `link` action with a URL is a link.
 */
export function ItemActions({ resource, actions, item, onRun }: ItemActionsProps) {
    const intl = usePanneauIntl();
    const toasts = useToast();
    const runAction = useActionRunner(resource);
    const [pending, setPending] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<ListActionEvent | null>(null);
    const available = actions.filter(
        (action) => action.scope.includes('item') && isAllowedOn(action, item),
    );
    if (available.length === 0) {
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
                    title: intl.formatMessage(listsMessages.actionFailed, { action: action.label }),
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
            {available.map((action) => {
                const icon = getActionIcon(action);
                const href = getActionHref(action, item);
                return href !== null ? (
                    <Link key={action.id} href={href} className={styles.actionLink}>
                        {icon !== undefined ? <Icon icon={icon} size="sm" /> : null}
                        {action.label}
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
                        {action.label}
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
