import { Columns3, Ellipsis, ListChecks } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { Menu, MenuItem, MenuSection, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { ActionButton } from '../actions/ActionButton';
import { type ActionIcons, getActionIcon } from '../actions/icons';
import { messages } from '../messages';
import { ColumnDialog, ColumnMenu, type ColumnMenuProps } from './ColumnMenu';
import { LayoutSwitch, type LayoutSwitchProps } from './LayoutSwitch';
import { SortMenu, type SortMenuProps, SortSection } from './SortMenu';
import styles from './Toolbar.module.css';
import { ToolbarButton } from './ToolbarButton';

/** An action of the whole list in its toolbar, such as an export. */
export interface ToolbarAction {
    action: Action;
    href: string | null;
    isPending: boolean;
}

export interface ToolbarControlsProps {
    /** A narrow list (a phone): the controls take one row, with the less used ones in a menu. */
    narrow: boolean;
    /** The sort, where the layout shows it. */
    sort: SortMenuProps | null;
    /** The choice of the columns, where the layout shows them. */
    columns: ColumnMenuProps | null;
    layouts: LayoutSwitchProps | null;
    /** The "Select" button, where the layout selects. */
    selection: { isSelecting: boolean; onPress: () => void } | null;
    actions: readonly ToolbarAction[];
    /** Runs an action of the list. */
    onAction: (action: Action) => void;
    icons?: ActionIcons | undefined;
    /** Content at the end, such as a button to create an item. */
    children?: ReactNode;
}

/** The key of the item of the narrow menu that opens the columns. */
const COLUMNS = ':columns';

function SelectButton({ isSelecting, onPress }: { isSelecting: boolean; onPress: () => void }) {
    const intl = usePanneauIntl();
    const label = intl.formatMessage(isSelecting ? messages.endSelection : messages.startSelection);
    // "Done" says what pressing it does, which its icon doesn't: it keeps its label (#424).
    return (
        <ToolbarButton
            icon={ListChecks}
            label={label}
            appearance={isSelecting ? 'solid' : 'outline'}
            onPress={onPress}
        >
            {isSelecting ? label : null}
        </ToolbarButton>
    );
}

/**
 * The controls at the end of a list's toolbar: its actions, the sort, the columns, "Select", the
 * layout switch, then what the caller adds. What comes and goes with the layout or the selection
 * is at the start, away from the end that holds the row in place, so that the layout switch
 * doesn't move under the pointer (#412). In a narrow list, the layout switch and "Select" stay,
 * and the sort, the columns and the actions go in a menu (#406).
 */
export function ToolbarControls({
    narrow,
    sort,
    columns,
    layouts,
    selection,
    actions,
    onAction,
    icons,
    children,
}: ToolbarControlsProps) {
    const intl = usePanneauIntl();
    const [columnsOpen, setColumnsOpen] = useState(false);
    if (!narrow) {
        return (
            <div className={styles.controls}>
                {actions.map(({ action, href, isPending }) => (
                    <ActionButton
                        key={action.id}
                        action={action}
                        icons={icons}
                        size="md"
                        href={href}
                        isPending={isPending}
                        onPress={() => onAction(action)}
                    />
                ))}
                {sort !== null ? <SortMenu {...sort} /> : null}
                {columns !== null ? <ColumnMenu {...columns} /> : null}
                {selection !== null ? <SelectButton {...selection} /> : null}
                {layouts !== null ? <LayoutSwitch {...layouts} /> : null}
                {children}
            </div>
        );
    }
    const moreLabel = intl.formatMessage(messages.moreOptions);
    const hasMore = sort !== null || columns !== null || actions.length > 0;
    return (
        <div className={styles.controls} data-narrow="">
            {layouts !== null ? <LayoutSwitch {...layouts} /> : null}
            {selection !== null ? <SelectButton {...selection} /> : null}
            {hasMore ? (
                <MenuTrigger>
                    <ToolbarButton
                        icon={Ellipsis}
                        label={moreLabel}
                        isPending={actions.some((entry) => entry.isPending)}
                    />
                    <Menu
                        aria-label={moreLabel}
                        placement="bottom end"
                        onAction={(key) => {
                            if (key === COLUMNS) {
                                setColumnsOpen(true);
                                return;
                            }
                            const entry = actions.find(({ action }) => action.id === key);
                            if (entry !== undefined && entry.href === null) {
                                onAction(entry.action);
                            }
                        }}
                    >
                        {sort !== null ? <SortSection {...sort} /> : null}
                        {columns !== null || actions.length > 0 ? (
                            <MenuSection aria-label={moreLabel}>
                                {columns !== null ? (
                                    <MenuItem id={COLUMNS} icon={Columns3}>
                                        {intl.formatMessage(messages.columns)}
                                    </MenuItem>
                                ) : null}
                                {actions.map(({ action, href }) => {
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
                            </MenuSection>
                        ) : null}
                    </Menu>
                </MenuTrigger>
            ) : null}
            {children}
            {columns !== null ? (
                <ColumnDialog {...columns} isOpen={columnsOpen} onOpenChange={setColumnsOpen} />
            ) : null}
        </div>
    );
}
