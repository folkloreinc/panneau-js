import { Ellipsis } from 'lucide-react';
import { type ReactNode, use } from 'react';

import type { ItemAction } from '@panneau/core';
import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { IconButton, Menu, MenuItem, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import { ActionButton } from './ActionButton';
import styles from './Actions.module.css';
import { RowActionsFit } from './fit';
import { type ActionIcons, getActionIcon } from './icons';

export interface RowActionsProps {
    /** The label of the item, for the accessible names of its actions. */
    itemLabel: string;
    /** Actions placed in `row`, with their links (`selectItemActions()` of `@panneau/core`). */
    actions: readonly ItemAction[];
    /** Actions placed in `menu`: buttons too while they fit, the first to go in the menu. */
    menu: readonly ItemAction[];
    /** Id of the action that is running on this item, if any. */
    pending: string | null;
    onRun: (action: Action) => void;
    /** Icons of actions by id, over the icon the action names. */
    icons?: ActionIcons | undefined;
    /**
     * The actions of every row of the list, in order (`orderRowActions()`): a row keeps the place
     * of those it doesn't have, so the actions of the rows line up. Without it, its own.
     */
    slots?: readonly ItemAction[] | undefined;
}

/**
 * The actions of a row in their order: those placed in `row`, then those placed in `menu`, and
 * those that destroy last. The last ones are the first to go in the menu.
 */
export function orderRowActions(
    actions: readonly ItemAction[],
    menu: readonly ItemAction[],
): ItemAction[] {
    const all = [...actions, ...menu].filter(
        (entry, index, list) =>
            list.findIndex((other) => other.action.id === entry.action.id) === index,
    );
    return [
        ...all.filter(({ action }) => action.destructive !== true),
        ...all.filter(({ action }) => action.destructive === true),
    ];
}

/**
 * The actions of a row (decision 0060): buttons with their labels; their icons alone when the row
 * lacks room; and when even those don't fit, the last ones in an overflow menu, which never holds
 * a single action. How they fit is the same for every row of the list (`RowActionsFit`), and a
 * row keeps the place of the actions of other rows that it doesn't have, so they line up.
 */
export function RowActions({
    itemLabel,
    actions,
    menu,
    pending,
    onRun,
    icons,
    slots,
}: RowActionsProps) {
    const intl = usePanneauIntl();
    const level = use(RowActionsFit);
    const own = orderRowActions(actions, menu);
    const all = [
        ...(slots ?? []),
        ...own.filter(({ action }) => slots?.some((slot) => slot.action.id === action.id) !== true),
    ];
    const find = (slot: ItemAction) => own.find(({ action }) => action.id === slot.action.id);
    const inMenu = level >= 2 && all.length >= 2 ? Math.min(level, all.length) : 0;
    const shown = all.slice(0, all.length - inMenu);
    const overflow = all.slice(all.length - inMenu).flatMap((slot) => find(slot) ?? []);
    const name = (action: Action) =>
        intl.formatMessage(messages.actionOnItem, {
            action: getActionLabel(action, intl),
            item: itemLabel,
        });
    const button = (entry: ItemAction) => (
        <ActionButton
            key={entry.action.id}
            action={entry.action}
            icons={icons}
            href={entry.href}
            iconOnly={level >= 1}
            isPending={pending === entry.action.id}
            isDisabled={pending !== null && pending !== entry.action.id}
            aria-label={name(entry.action)}
            onPress={() => onRun(entry.action)}
        />
    );
    // The place of an action of other rows: the same button, unseen and out of reach
    const placeholder = (key: string, content: ReactNode) => (
        <span key={key} className={styles.placeholder} aria-hidden="true" inert>
            {content}
        </span>
    );
    const menuButton = (
        <IconButton
            icon={Ellipsis}
            size="sm"
            label={intl.formatMessage(messages.itemActions, { item: itemLabel })}
            showTooltip={overflow.length >= 2}
            isPending={pending !== null && overflow.some(({ action }) => action.id === pending)}
        />
    );
    return (
        <div className={styles.row} data-row-actions={all.length}>
            {shown.map((slot) => {
                const entry = find(slot);
                return entry !== undefined
                    ? button(entry)
                    : placeholder(slot.action.id, button({ ...slot, href: null }));
            })}
            {overflow.length >= 2 ? (
                <MenuTrigger>
                    {menuButton}
                    <Menu
                        placement="bottom end"
                        onAction={(key) => {
                            const entry = overflow.find(({ action }) => action.id === key);
                            if (entry !== undefined && entry.href === null) {
                                onRun(entry.action);
                            }
                        }}
                    >
                        {overflow.map(({ action, href }) => {
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
            ) : overflow.length === 1 && overflow[0] !== undefined ? (
                // A single action is no menu: its button, in the menu's place
                button(overflow[0])
            ) : inMenu > 0 ? (
                placeholder('menu', menuButton)
            ) : null}
        </div>
    );
}
