import { Checkbox, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListLayoutProps } from '../types';
import styles from './CardsLayout.module.css';
import { ItemTitle } from './ItemTitle';

/** Items as cards: the first column is the title, the others are listed under it. */
export function CardsLayout({
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
    label,
    pageSelection,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const [title, ...others] = columns;
    return (
        <div>
            {selectable ? <div className={styles.pageSelection}>{pageSelection}</div> : null}
            <ul className={styles.cards} aria-label={label}>
                {items.map((item) => {
                    const selected = selectable && isSelected(item);
                    const actions = renderActions(item);
                    const current = isCurrent?.(item) ?? false;
                    return (
                        <li
                            key={item.id}
                            className={styles.card}
                            data-selected={selected || undefined}
                            data-current={current || undefined}
                        >
                            <div className={styles.header}>
                                <div className={styles.title}>
                                    <ItemTitle href={getItemHref?.(item) ?? null} current={current}>
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
                                <div className={styles.actions}>{actions}</div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
