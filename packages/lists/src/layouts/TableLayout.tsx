import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type FileKind, FileThumbnail } from '@panneau/fields';
import { Checkbox, Icon, usePanneauIntl } from '@panneau/ui';

import { RowActionsFit, fitContent, useRowActionsFit } from '../actions/fit';
import { getColumnLabel } from '../columns';
import { cx } from '../cx';
import { messages } from '../messages';
import type { ListColumn, ListLayoutProps } from '../types';
import { ItemTitle } from './ItemTitle';
import styles from './TableLayout.module.css';
import highlight from './highlight.module.css';
import { getRowClickProps } from './rowClick';

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
 * comes into view, the icon of its file's kind (a PDF without a preview), or an empty square, so
 * that titles stay aligned. It has no text: the title is
 * next to it.
 */
function Thumbnail({ url, kind }: { url: string | null; kind: FileKind | null }) {
    return (
        <span className={styles.thumbnail}>
            {url !== null || kind !== null ? (
                <FileThumbnail src={url} kind={kind} iconSize={18} />
            ) : null}
        </span>
    );
}

/**
 * Whether the table is wider than its container, which then scrolls it sideways. Without
 * ResizeObserver (jsdom), the table fits.
 */
function useOverflows(): [overflows: boolean, ref: (table: HTMLElement | null) => void] {
    const [table, setTable] = useState<HTMLElement | null>(null);
    const [overflows, setOverflows] = useState(false);
    useEffect(() => {
        const container = table?.parentElement;
        if (table === null || container == null || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(() => {
            setOverflows(table.offsetWidth > container.clientWidth + 1);
        });
        observer.observe(container);
        observer.observe(table);
        return () => observer.disconnect();
    }, [table]);
    return [overflows, setTable];
}

/**
 * Items as a table, with sortable column headers. With the image of items (`getItemImage`), each
 * title starts with a thumbnail. On narrow lists (phones), each row turns into a block that shows
 * the label of each value. To keep the table light, the arrows of sortable columns and the
 * checkboxes of rows show on hover and focus, the arrow of the sorted column and the checkboxes
 * once a row is selected always, and both always on touch screens.
 *
 * The header sticks under the top of the window (`--panneau-frame-top`, and the selection bar of
 * the list) while the table scrolls with the page. A table wider than the list scrolls in its own
 * box, as high as the window at most, where its header sticks. A click on a row outside its
 * controls opens its item, as its title does; in select mode, it selects the item.
 */
export function TableLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    onItemIntent,
    getItemImage,
    getItemFileKind,
    isCurrent,
    isHighlighted,
    isLeaving,
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
    const [overflows, measureOverflow] = useOverflows();
    const selecting = selectable && items.some((item) => isSelected(item));
    return (
        <RowActionsFit value={fitLevel}>
            <div
                className={styles.scroller}
                data-overflows={overflows || undefined}
                ref={measureList}
            >
                <table
                    ref={measureOverflow}
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
                                                {getColumnLabel(column)}
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
                                            getColumnLabel(column)
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
                            const leaving = isLeaving?.(item) ?? false;
                            const rowClass = cx(
                                highlighted && highlight.highlighted,
                                leaving && highlight.leaving,
                            );
                            const opens = selectable || href !== null;
                            return (
                                <tr
                                    key={item.id}
                                    className={rowClass === '' ? undefined : rowClass}
                                    data-selected={selected || undefined}
                                    data-current={current || undefined}
                                    data-highlighted={highlighted || undefined}
                                    data-item-id={item.id}
                                    data-leaving={leaving || undefined}
                                    data-opens={opens || undefined}
                                    inert={leaving || undefined}
                                    {...(opens
                                        ? getRowClickProps({
                                              selecting: selectable,
                                              onToggle: () => onToggle(item),
                                          })
                                        : {})}
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
                                                <ItemTitle
                                                    href={href}
                                                    current={current}
                                                    onIntent={
                                                        onItemIntent !== undefined
                                                            ? () => onItemIntent(item)
                                                            : undefined
                                                    }
                                                >
                                                    {renderValue(item, column)}
                                                </ItemTitle>
                                            ) : (
                                                renderValue(item, column)
                                            );
                                        const rendered =
                                            renderCell !== undefined
                                                ? renderCell(item, column, content)
                                                : content;
                                        const cell = <span>{rendered}</span>;
                                        return (
                                            <td
                                                key={column.id}
                                                className={cx(
                                                    alignClass(column),
                                                    index === 0 && styles.title,
                                                )}
                                                data-item-title={index === 0 || undefined}
                                                // A cell the list renders itself (edited in
                                                // place): a click in it stays in it.
                                                data-row-control={rendered !== content || undefined}
                                            >
                                                <span className={styles.cellLabel}>
                                                    {getColumnLabel(column)}
                                                </span>
                                                {index === 0 && getItemImage !== undefined ? (
                                                    <span className={styles.withThumbnail}>
                                                        <Thumbnail
                                                            url={getItemImage(item)}
                                                            kind={getItemFileKind?.(item) ?? null}
                                                        />
                                                        {cell}
                                                    </span>
                                                ) : (
                                                    cell
                                                )}
                                            </td>
                                        );
                                    })}
                                    {hasActions ? (
                                        // A click that misses an action doesn't open the item
                                        <td className={styles.actionsCell} data-row-control>
                                            {actions[row]}
                                        </td>
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
