import { Checkbox, usePanneauIntl } from '@panneau/ui';

import { RowActionsFit, fitContent, useRowActionsFit } from '../actions/fit';
import { cx } from '../cx';
import { messages } from '../messages';
import type { ListLayoutProps } from '../types';
import styles from './CardsLayout.module.css';
import { ItemTitle } from './ItemTitle';
import highlight from './highlight.module.css';
import { getRowClickProps } from './rowClick';

/** Items as cards: the first column is the title, the others are listed under it. */
export function CardsLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    isCurrent,
    isHighlighted,
    isLeaving,
    selectable,
    isSelected,
    onToggle,
    renderActions,
    label,
    pageSelection,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const [title, ...others] = columns;
    const [fitLevel, measureList] = useRowActionsFit(fitContent(items, columns));
    return (
        <RowActionsFit value={fitLevel}>
            <div ref={measureList}>
                {selectable ? <div className={styles.pageSelection}>{pageSelection}</div> : null}
                <ul className={styles.cards} aria-label={label}>
                    {items.map((item) => {
                        const selected = selectable && isSelected(item);
                        const actions = renderActions(item);
                        const current = isCurrent?.(item) ?? false;
                        const highlighted = isHighlighted?.(item) ?? false;
                        const leaving = isLeaving?.(item) ?? false;
                        const href = getItemHref?.(item) ?? null;
                        const opens = selectable || href !== null;
                        return (
                            <li
                                key={item.id}
                                className={cx(
                                    styles.card,
                                    highlighted && highlight.highlighted,
                                    leaving && highlight.leaving,
                                )}
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
                                <div className={styles.header}>
                                    <div className={styles.title} data-item-title>
                                        <ItemTitle href={href} current={current}>
                                            {title !== undefined
                                                ? renderValue(item, title)
                                                : getItemLabel(item)}
                                        </ItemTitle>
                                    </div>
                                    {selectable ? (
                                        <Checkbox
                                            aria-label={intl.formatMessage(messages.selectItem, {
                                                item: getItemLabel(item),
                                            })}
                                            isSelected={selected}
                                            onChange={() => onToggle(item)}
                                        />
                                    ) : null}
                                </div>
                                {others.length > 0 ? (
                                    <dl className={styles.values}>
                                        {others.map((column) => (
                                            <div key={column.id} className={styles.value}>
                                                <dt>{column.label ?? column.id}</dt>
                                                <dd>{renderValue(item, column)}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : null}
                                {actions !== null ? (
                                    <div className={styles.actions} data-row-control>
                                        {actions}
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </RowActionsFit>
    );
}
