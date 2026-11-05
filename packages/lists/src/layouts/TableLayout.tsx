import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Checkbox, Icon, usePanneauIntl } from '@panneau/ui';

import { RowActionsFit, fitContent, useRowActionsFit } from '../actions/fit';
import { cx } from '../cx';
import { messages } from '../messages';
import type { ListColumn, ListLayoutProps } from '../types';
import { ItemTitle } from './ItemTitle';
import styles from './TableLayout.module.css';
import highlight from './highlight.module.css';

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
 * The thumbnail of an item, before its title (decision 0061): a square of its image, loaded when it
 * comes into view, or an empty square, so that titles stay aligned. It has no text: the title is
 * next to it.
 */
function Thumbnail({ url }: { url: string | null }) {
    return (
        <span className={styles.thumbnail}>
            {url !== null ? <img src={url} alt="" loading="lazy" decoding="async" /> : null}
        </span>
    );
}

/**
 * Items as a table, with sortable column headers. With the image of items (`getItemImage`), each
 * title starts with a thumbnail. On narrow lists (phones), each row turns into a block that shows
 * the label of each value. To keep the table light, the arrows of sortable columns and the
 * checkboxes of rows show on hover and focus, the arrow of the sorted column and the checkboxes
 * once a row is selected always, and both always on touch screens.
 */
export function TableLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    getItemImage,
    isCurrent,
    isHighlighted,
    selectable,
    isSelected,
    onToggle,
    renderActions,
    sort,
    onSort,
    label,
    pageSelection,
    renderCell,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const actions = items.map((item) => renderActions(item));
    const hasActions = actions.some((node) => node !== null);
    const [fitLevel, measureList] = useRowActionsFit(fitContent(items, columns));
    const selecting = selectable && items.some((item) => isSelected(item));
    return (
        <RowActionsFit value={fitLevel}>
            <div className={styles.scroller} ref={measureList}>
                <table
                    className={styles.table}
                    aria-label={label}
                    data-selecting={selecting || undefined}
                >
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
                                            column.sortable === true
                                                ? (direction ?? 'none')
                                                : undefined
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
                            const highlighted = isHighlighted?.(item) ?? false;
                            return (
                                <tr
                                    key={item.id}
                                    className={highlighted ? highlight.highlighted : undefined}
                                    data-selected={selected || undefined}
                                    data-current={current || undefined}
                                    data-highlighted={highlighted || undefined}
                                >
                                    {selectable ? (
                                        <td className={styles.check}>
                                            <Checkbox
                                                aria-label={intl.formatMessage(
                                                    messages.selectItem,
                                                    {
                                                        item: getItemLabel(item),
                                                    },
                                                )}
                                                isSelected={selected}
                                                onChange={() => onToggle(item)}
                                            />
                                        </td>
                                    ) : null}
                                    {columns.map((column, index) => {
                                        const content =
                                            index === 0 ? (
                                                <ItemTitle href={href} current={current}>
                                                    {renderValue(item, column)}
                                                </ItemTitle>
                                            ) : (
                                                renderValue(item, column)
                                            );
                                        const cell = (
                                            <span>
                                                {renderCell !== undefined
                                                    ? renderCell(item, column, content)
                                                    : content}
                                            </span>
                                        );
                                        return (
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
                                                {index === 0 && getItemImage !== undefined ? (
                                                    <span className={styles.withThumbnail}>
                                                        <Thumbnail url={getItemImage(item)} />
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    cell
                                                )}
                                            </td>
                                        );
                                    })}
                                    {hasActions ? (
                                        <td className={styles.actionsCell}>{actions[row]}</td>
                                    ) : null}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </RowActionsFit>
    );
}
