import { Ellipsis } from 'lucide-react';

import type { Action } from '@panneau/protocol';
import { IconButton, Menu, MenuItem, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListItem } from '../types';
import { ActionButton } from './ActionButton';
import styles from './Actions.module.css';
import { getActionHref } from './actions';
import { getActionIcon } from './icons';

export interface RowActionsProps {
    item: ListItem;
    /** The label of the item, for the accessible names of its actions. */
    itemLabel: string;
    /** Actions shown as buttons. */
    actions: readonly Action[];
    /** Actions in the overflow menu. */
    menu: readonly Action[];
    /** Id of the action that is running on this item, if any. */
    pending: string | null;
    onRun: (action: Action) => void;
}

/** The actions of a row: buttons, then an overflow menu. */
export function RowActions({ item, itemLabel, actions, menu, pending, onRun }: RowActionsProps) {
    const intl = usePanneauIntl();
    return (
        <div className={styles.row}>
            {actions.map((action) => (
                <ActionButton
                    key={action.id}
                    action={action}
                    href={getActionHref(action, item)}
                    isPending={pending === action.id}
                    isDisabled={pending !== null && pending !== action.id}
                    aria-label={intl.formatMessage(messages.actionOnItem, {
                        action: action.label,
                        item: itemLabel,
                    })}
                    onPress={() => onRun(action)}
                />
            ))}
            {menu.length > 0 ? (
                <MenuTrigger>
                    <IconButton
                        icon={Ellipsis}
                        size="sm"
                        label={intl.formatMessage(messages.itemActions, { item: itemLabel })}
                        isPending={pending !== null && menu.some((action) => action.id === pending)}
                    />
                    <Menu
                        placement="bottom end"
                        onAction={(key) => {
                            const action = menu.find((candidate) => candidate.id === key);
                            if (action !== undefined && getActionHref(action, item) === null) {
                                onRun(action);
                            }
                        }}
                    >
                        {menu.map((action) => {
                            const href = getActionHref(action, item);
                            const icon = getActionIcon(action);
                            return (
                                <MenuItem
                                    key={action.id}
                                    id={action.id}
                                    isDanger={action.destructive === true}
                                    {...(icon !== undefined ? { icon } : {})}
                                    {...(href !== null ? { href } : {})}
                                >
                                    {action.label}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </MenuTrigger>
            ) : null}
        </div>
    );
}
