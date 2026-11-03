import { ImageOff } from 'lucide-react';

import { Checkbox, Icon, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListLayoutProps } from '../types';
import styles from './GalleryLayout.module.css';
import { ItemTitle } from './ItemTitle';

/**
 * Items as a grid of images (decision 0044): the image of each item (`itemImage` of the
 * resource), its title under it, its checkbox and its actions. An item without an image shows a
 * placeholder.
 */
export function GalleryLayout({
    items,
    columns,
    renderValue,
    getItemLabel,
    getItemHref,
    getItemImage,
    isCurrent,
    selectable,
    isSelected,
    onToggle,
    renderActions,
    label,
    pageSelection,
}: ListLayoutProps) {
    const intl = usePanneauIntl();
    const [title] = columns;
    return (
        <div>
            {selectable ? <div className={styles.pageSelection}>{pageSelection}</div> : null}
            <ul className={styles.gallery} aria-label={label}>
                {items.map((item) => {
                    const selected = selectable && isSelected(item);
                    const actions = renderActions(item);
                    const current = isCurrent?.(item) ?? false;
                    const image = getItemImage?.(item) ?? null;
                    return (
                        <li
                            key={item.id}
                            className={styles.tile}
                            data-selected={selected || undefined}
                            data-current={current || undefined}
                        >
                            <div className={styles.media}>
                                {image !== null ? (
                                    <img src={image} alt="" loading="lazy" />
                                ) : (
                                    <span className={styles.placeholder}>
                                        <Icon icon={ImageOff} size="lg" />
                                    </span>
                                )}
                                {selectable ? (
                                    <span className={styles.check}>
                                        <Checkbox
                                            aria-label={intl.formatMessage(messages.selectItem, {
                                                item: getItemLabel(item),
                                            })}
                                            isSelected={selected}
                                            onChange={() => onToggle(item)}
                                        />
                                    </span>
                                ) : null}
                            </div>
                            <div className={styles.caption}>
                                <div className={styles.title}>
                                    <ItemTitle href={getItemHref?.(item) ?? null} current={current}>
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
    );
}
