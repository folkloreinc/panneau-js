import { Ellipsis, ListChecks } from 'lucide-react';
import { type ReactNode, Suspense, lazy } from 'react';

import type { Action } from '@panneau/protocol';
import { usePanneauIntl } from '@panneau/ui';

import { ActionButton } from '../actions/ActionButton';
import type { ActionIcons } from '../actions/icons';
import { messages } from '../messages';
import { ColumnMenu, type ColumnMenuProps } from './ColumnMenu';
import { LayoutSwitch, type LayoutSwitchProps } from './LayoutSwitch';
import { SortMenu, type SortMenuProps } from './SortMenu';
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

const MoreMenu = lazy(async () => ({ default: (await import('./MoreMenu')).MoreMenu }));

function SelectButton({ isSelecting, onPress }: { isSelecting: boolean; onPress: () => void }) {
    const intl = usePanneauIntl();
    const label = intl.formatMessage(isSelecting ? messages.endSelection : messages.startSelection);
    // Only its icon in both states (#487): solid while selecting, named and with a tooltip that
    // says what pressing it does ("Select", "Done").
    return (
        <ToolbarButton
            icon={ListChecks}
            label={label}
            appearance={isSelecting ? 'solid' : 'outline'}
            onPress={onPress}
        />
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
                // Only phones show it: loaded when one does, out of the first page's code
                <Suspense fallback={<ToolbarButton icon={Ellipsis} label={moreLabel} />}>
                    <MoreMenu
                        sort={sort}
                        columns={columns}
                        actions={actions}
                        onAction={onAction}
                        icons={icons}
                    />
                </Suspense>
            ) : null}
            {children}
        </div>
    );
}
