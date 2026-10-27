import { Check } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import {
    Menu as AriaMenu,
    MenuItem as AriaMenuItem,
    type MenuItemProps as AriaMenuItemProps,
    type MenuProps as AriaMenuProps,
    MenuSection as AriaMenuSection,
    type MenuSectionProps as AriaMenuSectionProps,
    Header,
    Separator,
    Text,
} from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { PopoverSurface } from '../popover/Popover';
import listBoxStyles from '../select/ListBox.module.css';
import { cx } from '../utils/cx';
import styles from './Menu.module.css';

export interface MenuProps<T extends object> extends Omit<AriaMenuProps<T>, 'className' | 'style'> {
    className?: string;
    popoverClassName?: string;
    placement?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
    /**
     * A short note under the items, after a line, such as "Only this step changes.". It isn't an
     * item and can't be focused: the menu is described by it.
     */
    footer?: ReactNode;
    footerClassName?: string;
}

/**
 * A menu of actions, inside a `MenuTrigger` with its button as the first child. Arrow keys move
 * between items, and typing a letter jumps to an item. With `selectionMode` (`single` or
 * `multiple`) and `selectedKeys`, its items are choices, and the selected ones have a check.
 */
export function Menu<T extends object>({
    className,
    popoverClassName,
    placement = 'bottom start',
    footer,
    footerClassName,
    ...props
}: MenuProps<T>) {
    const footerId = useId();
    const hasFooter = footer !== undefined && footer !== null;
    const menu = (
        <AriaMenu
            {...props}
            aria-describedby={
                hasFooter
                    ? [props['aria-describedby'], footerId].filter(Boolean).join(' ')
                    : props['aria-describedby']
            }
            className={cx('panneau-menu', listBoxStyles.listBox, className)}
        />
    );
    return (
        <PopoverSurface placement={placement} className={popoverClassName}>
            {hasFooter ? (
                <div className={styles.layout}>
                    {menu}
                    <div id={footerId} className={cx(styles.footer, footerClassName)}>
                        {footer}
                    </div>
                </div>
            ) : (
                menu
            )}
        </PopoverSurface>
    );
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'className' | 'style' | 'children'> {
    children?: ReactNode;
    icon?: IconComponent;
    /**
     * Leading media instead of an icon, such as an avatar or an image, sized with the item: larger
     * when the item has a description.
     */
    media?: ReactNode;
    description?: string;
    /** Styles the item as destructive. */
    isDanger?: boolean;
    className?: string;
}

/**
 * An item of a `Menu`. In a menu with a `selectionMode`, a selected item has a check at its end,
 * and the role of a radio (single) or a checkbox (multiple) item.
 */
export function MenuItem({
    children,
    icon,
    media,
    description,
    isDanger = false,
    className,
    textValue,
    ...props
}: MenuItemProps) {
    return (
        <AriaMenuItem
            {...props}
            textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
            className={cx('panneau-menu-item', listBoxStyles.item, styles.item, className)}
            data-danger={isDanger || undefined}
        >
            {({ isSelected, selectionMode }) => (
                <>
                    {media !== undefined && media !== null ? (
                        <span className={styles.media}>{media}</span>
                    ) : icon !== undefined ? (
                        <Icon icon={icon} />
                    ) : null}
                    <span className={listBoxStyles.itemText}>
                        <Text slot="label" className={listBoxStyles.itemLabel}>
                            {children}
                        </Text>
                        {description !== undefined ? (
                            <Text slot="description" className={listBoxStyles.itemDescription}>
                                {description}
                            </Text>
                        ) : null}
                    </span>
                    {selectionMode !== 'none' ? (
                        <span className={styles.check}>
                            {isSelected ? <Icon icon={Check} size="sm" /> : null}
                        </span>
                    ) : null}
                </>
            )}
        </AriaMenuItem>
    );
}

export interface MenuSectionProps<T extends object> extends Omit<
    AriaMenuSectionProps<T>,
    'className' | 'style' | 'children' | 'items'
> {
    /**
     * The header of the section, a small muted eyebrow above its items, such as "Publish on". It
     * labels the group. Without it, give the section an `aria-label`.
     */
    title?: ReactNode;
    children?: ReactNode;
    className?: string;
    headerClassName?: string;
}

/** A group of items of a `Menu`, with a header. */
export function MenuSection<T extends object>({
    title,
    children,
    className,
    headerClassName,
    ...props
}: MenuSectionProps<T>) {
    return (
        <AriaMenuSection {...props} className={cx(styles.section, className)}>
            {title !== undefined && title !== null ? (
                <Header className={cx(styles.header, headerClassName)}>{title}</Header>
            ) : null}
            {children}
        </AriaMenuSection>
    );
}

/** A line between groups of menu items. */
export function MenuSeparator() {
    return <Separator className={listBoxStyles.separator} />;
}

export { MenuTrigger } from 'react-aria-components';
