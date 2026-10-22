import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Checkbox, Icon, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { messages } from '../messages';
import type { ListColumn, ListLayoutProps } from '../types';
import { ItemTitle } from './ItemTitle';
import styles from './TableLayout.module.css';

/** The sort direction of a column, from the first `sort` value. */
export function getSortDirection(
    sort: readonly string[],
    column: ListColumn,
): 'ascending' | 'descending' | null {
    const first = sort[0];
    if (first === column.id) {
        return 'ascending';
    }
    return first === `-${column.id}` ? 'descending' : null;
}

function alignClass(column: ListColumn): string | undefined {
    if (column.align === 'center') {
        return styles.center;
    }
    return column.align === 'end' ? styles.end : undefined;
}

/**
 * Items as a table, with sortable column headers. On narrow lists (phones), each row turns into a
 * block that shows the label of each value.
 */
export function TableLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    isCurrent,
    selectable,
    isSelected,
    onToggle,
    renderActions,
    sort,
    onSort,
    label,
    pageSelection,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const actions = items.map((item) => renderActions(item));
    const hasActions = actions.some((node) => node !== null);
    return (
        <div className={styles.scroller}>
            <table className={styles.table} aria-label={label}>
                <thead>
                    <tr>
                        {selectable ? <th className={styles.check}>{pageSelection}</th> : null}
                        {columns.map((column) => {
                            const direction = getSortDirection(sort, column);
                            return (
                                <th
                                    key={column.id}
                                    scope="col"
                                    className={alignClass(column)}
                                    style={
                                        column.width !== undefined
                                            ? { width: column.width }
                                            : undefined
                                    }
                                    aria-sort={
                                        column.sortable === true ? (direction ?? 'none') : undefined
                                    }
                                >
                                    {column.sortable === true ? (
                                        <button
                                            type="button"
                                            className={cx(
                                                styles.sort,
                                                direction !== null && styles.sorted,
                                            )}
                                            onClick={() => onSort(column)}
                                        >
                                            {column.label ?? column.id}
                                            <span className={styles.sortIcon}>
                                                <Icon
                                                    icon={
                                                        direction === 'ascending'
                                                            ? ArrowUp
                                                            : direction === 'descending'
                                                              ? ArrowDown
                                                              : ArrowUpDown
                                                    }
                                                    size="sm"
                                                />
                                            </span>
                                        </button>
                                    ) : (
                                        (column.label ?? column.id)
                                    )}
                                </th>
                            );
                        })}
                        {hasActions ? (
                            <th className={styles.actionsCell}>
                                <span className={styles.visuallyHidden}>
                                    {intl.formatMessage(messages.actions)}
                                </span>
                            </th>
                        ) : null}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, row) => {
                        const selected = selectable && isSelected(item);
                        const href = getItemHref?.(item) ?? null;
                        const current = isCurrent?.(item) ?? false;
                        return (
                            <tr
                                key={item.id}
                                data-selected={selected || undefined}
                                data-current={current || undefined}
                            >
                                {selectable ? (
                                    <td className={styles.check}>
                                        <Checkbox
                                            aria-label={intl.formatMessage(messages.selectItem, {
                                                item: getItemLabel(item),
                                            })}
                                            isSelected={selected}
                                            onChange={() => onToggle(item)}
                                        />
                                    </td>
                                ) : null}
                                {columns.map((column, index) => (
                                    <td
                                        key={column.id}
                                        className={cx(
                                            alignClass(column),
                                            index === 0 && styles.title,
                                        )}
                                    >
                                        <span className={styles.cellLabel}>
                                            {column.label ?? column.id}
                                        </span>
                                        <span>
                                            {index === 0 ? (
                                                <ItemTitle href={href} current={current}>
                                                    {renderValue(item, column)}
                                                </ItemTitle>
                                            ) : (
                                                renderValue(item, column)
                                            )}
                                        </span>
                                    </td>
                                ))}
                                {hasActions ? (
                                    <td className={styles.actionsCell}>{actions[row]}</td>
                                ) : null}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
