import type { ReactNode } from 'react';
import {
    Menu as AriaMenu,
    MenuItem as AriaMenuItem,
    type MenuItemProps as AriaMenuItemProps,
    type MenuProps as AriaMenuProps,
    Separator,
    Text,
} from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { PopoverSurface } from '../popover/Popover';
import styles from '../select/ListBox.module.css';
import { cx } from '../utils/cx';

export interface MenuProps<T extends object> extends Omit<AriaMenuProps<T>, 'className' | 'style'> {
    className?: string;
    popoverClassName?: string;
    placement?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
}

/**
 * A menu of actions, inside a `MenuTrigger` with its button as the first child. Arrow keys move
 * between items, and typing a letter jumps to an item.
 */
export function Menu<T extends object>({
    className,
    popoverClassName,
    placement = 'bottom start',
    ...props
}: MenuProps<T>) {
    return (
        <PopoverSurface placement={placement} className={popoverClassName}>
            <AriaMenu data-panneau="menu" {...props} className={cx(styles.listBox, className)} />
        </PopoverSurface>
    );
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'className' | 'style' | 'children'> {
    children?: ReactNode;
    icon?: IconComponent;
    description?: string;
    /** Styles the item as destructive. */
    isDanger?: boolean;
    className?: string;
}

/** An item of a `Menu`. */
export function MenuItem({
    children,
    icon,
    description,
    isDanger = false,
    className,
    textValue,
    ...props
}: MenuItemProps) {
    return (
        <AriaMenuItem
            data-panneau="menu-item"
            {...props}
            textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
            className={cx(styles.item, className)}
            data-danger={isDanger || undefined}
        >
            {icon !== undefined ? <Icon icon={icon} /> : null}
            <span className={styles.itemText}>
                <Text slot="label" className={styles.itemLabel}>
                    {children}
                </Text>
                {description !== undefined ? (
                    <Text slot="description" className={styles.itemDescription}>
                        {description}
                    </Text>
                ) : null}
            </span>
        </AriaMenuItem>
    );
}

/** A line between groups of menu items. */
export function MenuSeparator() {
    return <Separator className={styles.separator} />;
}

export { MenuTrigger } from 'react-aria-components';
