import { Ellipsis } from 'lucide-react';

import type { ItemAction } from '@panneau/core';
import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { IconButton, Menu, MenuItem, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import { ActionButton } from './ActionButton';
import styles from './Actions.module.css';
import { type ActionIcons, getActionIcon } from './icons';

export interface RowActionsProps {
    /** The label of the item, for the accessible names of its actions. */
    itemLabel: string;
    /** Actions shown as buttons, with their links (`getItemActions()` of `@panneau/core`). */
    actions: readonly ItemAction[];
    /** Actions in the overflow menu. */
    menu: readonly ItemAction[];
    /** Id of the action that is running on this item, if any. */
    pending: string | null;
    onRun: (action: Action) => void;
    /** Icons of actions by id, over the icon the action names. */
    icons?: ActionIcons | undefined;
}

/** The actions of a row: buttons, then an overflow menu. */
export function RowActions({ itemLabel, actions, menu, pending, onRun, icons }: RowActionsProps) {
    const intl = usePanneauIntl();
    return (
        <div className={styles.row}>
            {actions.map(({ action, href }) => (
                <ActionButton
                    key={action.id}
                    action={action}
                    icons={icons}
                    href={href}
                    isPending={pending === action.id}
                    isDisabled={pending !== null && pending !== action.id}
                    aria-label={intl.formatMessage(messages.actionOnItem, {
                        action: getActionLabel(action, intl),
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
                        isPending={
                            pending !== null && menu.some(({ action }) => action.id === pending)
                        }
                    />
                    <Menu
                        placement="bottom end"
                        onAction={(key) => {
                            const entry = menu.find(({ action }) => action.id === key);
                            if (entry !== undefined && entry.href === null) {
                                onRun(entry.action);
                            }
                        }}
                    >
                        {menu.map(({ action, href }) => {
                            const icon = getActionIcon(action, icons);
                            return (
                                <MenuItem
                                    key={action.id}
                                    id={action.id}
                                    isDanger={action.destructive === true}
                                    {...(icon !== undefined ? { icon } : {})}
                                    {...(href !== null ? { href } : {})}
                                >
                                    {getActionLabel(action, intl)}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </MenuTrigger>
            ) : null}
        </div>
    );
}
