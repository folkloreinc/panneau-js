import { ImageOff } from 'lucide-react';

import { Checkbox, Icon, usePanneauIntl } from '@panneau/ui';

import { RowActionsFit, fitContent, useRowActionsFit } from '../actions/fit';
import { cx } from '../cx';
import { messages } from '../messages';
import type { ListLayoutProps } from '../types';
import styles from './GalleryLayout.module.css';
import { ItemTitle } from './ItemTitle';
import highlight from './highlight.module.css';

/**
 * Items as a grid of images (decision 0044): the image of each item (`itemImage` of the
 * resource), and under it its checkbox, its title and its actions. Nothing covers the image: a
 * selected item has an accent outline. An item without an image shows a placeholder.
 */
export function GalleryLayout({
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
    label,
    pageSelection,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const [title] = columns;
    const [fitLevel, measureList] = useRowActionsFit(fitContent(items, columns));
    return (
        <RowActionsFit value={fitLevel}>
            <div ref={measureList}>
                {selectable ? <div className={styles.pageSelection}>{pageSelection}</div> : null}
                <ul className={styles.gallery} aria-label={label}>
                    {items.map((item) => {
                        const selected = selectable && isSelected(item);
                        const actions = renderActions(item);
                        const current = isCurrent?.(item) ?? false;
                        const highlighted = isHighlighted?.(item) ?? false;
                        const image = getItemImage?.(item) ?? null;
                        return (
                            <li
                                key={item.id}
                                className={cx(styles.tile, highlighted && highlight.highlighted)}
                                data-selected={selected || undefined}
                                data-current={current || undefined}
                                data-highlighted={highlighted || undefined}
                            >
                                <div className={styles.media}>
                                    {image !== null ? (
                                        <img src={image} alt="" loading="lazy" />
                                    ) : (
                                        <span className={styles.placeholder}>
                                            <Icon icon={ImageOff} size="lg" />
                                        </span>
                                    )}
                                </div>
                                <div className={styles.caption}>
                                    {selectable ? (
                                        <span className={styles.check}>
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
                                        </span>
                                    ) : null}
                                    <div className={styles.title}>
                                        <ItemTitle
                                            href={getItemHref?.(item) ?? null}
                                            current={current}
                                        >
                                            {title !== undefined
                                                ? renderValue(item, title)
                                                : getItemLabel(item)}
                                        </ItemTitle>
                                    </div>
                                    {actions !== null ? (
                                        <div className={styles.actions}>{actions}</div>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </RowActionsFit>
    );
}
