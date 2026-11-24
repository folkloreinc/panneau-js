import { Columns3, Ellipsis } from 'lucide-react';
import { useState } from 'react';

import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { Dialog, Menu, MenuItem, MenuSection, MenuTrigger, usePanneauIntl } from '@panneau/ui';

import { type ActionIcons, getActionIcon } from '../actions/icons';
import { messages } from '../messages';
import { ColumnChooser, type ColumnMenuProps } from './ColumnMenu';
import { type SortMenuProps, toSort, useSortOptions } from './SortMenu';
import { ToolbarButton } from './ToolbarButton';
import type { ToolbarAction } from './ToolbarControls';

export interface MoreMenuProps {
    sort: SortMenuProps | null;
    columns: ColumnMenuProps | null;
    actions: readonly ToolbarAction[];
    onAction: (action: Action) => void;
    icons?: ActionIcons | undefined;
}

/** The key of the item that opens the columns. */
const COLUMNS = ':columns';

/**
 * The menu of a narrow toolbar (#406): the sort, the columns (in a dialog) and the actions of the
 * list, which don't fit in the row of a phone.
 */
export function MoreMenu({ sort, columns, actions, onAction, icons }: MoreMenuProps) {
    const intl = usePanneauIntl();
    const [columnsOpen, setColumnsOpen] = useState(false);
    const label = intl.formatMessage(messages.moreOptions);
    return (
        <>
            <MenuTrigger>
                <ToolbarButton
                    icon={Ellipsis}
                    label={label}
                    isPending={actions.some((entry) => entry.isPending)}
                />
                <Menu
                    aria-label={label}
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
                        <MenuSection aria-label={label}>
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
            {columns !== null ? (
                <Dialog
                    title={intl.formatMessage(messages.columns)}
                    size="sm"
                    isOpen={columnsOpen}
                    onOpenChange={setColumnsOpen}
                >
                    <ColumnChooser {...columns} />
                </Dialog>
            ) : null}
        </>
    );
}

/** The sorts of a list as a section of a menu, such as the menu of a narrow toolbar. */
function SortSection({ columns, sort, onChange }: SortMenuProps) {
    const intl = usePanneauIntl();
    const { options, current } = useSortOptions({ columns, sort });
    return (
        <MenuSection
            title={intl.formatMessage(messages.sortBy)}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[current.id]}
            onSelectionChange={(keys) => {
                const next = toSort(keys);
                if (next !== null) {
                    onChange(next);
                }
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.id} id={option.id}>
                    {option.label}
                </MenuItem>
            ))}
        </MenuSection>
    );
}
