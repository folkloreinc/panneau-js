import type { ReactNode } from 'react';
import {
    Tab as AriaTab,
    TabList as AriaTabList,
    type TabListProps as AriaTabListProps,
    TabPanel as AriaTabPanel,
    type TabPanelProps as AriaTabPanelProps,
    type TabProps as AriaTabProps,
    Tabs as AriaTabs,
    type TabsProps as AriaTabsProps,
} from 'react-aria-components';

import { cx } from '../utils/cx';
import styles from './Tabs.module.css';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style'> {
    className?: string;
}

/** Tabs: a `TabList` of `Tab`s, then a `TabPanel` per tab, matched by `id`. */
export function Tabs({ className, ...props }: TabsProps) {
    return <AriaTabs {...props} className={cx(styles.tabs, className)} />;
}

export interface TabListProps<T extends object> extends Omit<
    AriaTabListProps<T>,
    'className' | 'style'
> {
    className?: string;
}

/** The row of tabs. It scrolls sideways when the tabs don't fit, on phones. */
export function TabList<T extends object>({ className, ...props }: TabListProps<T>) {
    return <AriaTabList {...props} className={cx(styles.list, className)} />;
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'style' | 'children'> {
    children?: ReactNode;
    className?: string;
}

/** A tab. Put a `Badge` in it for a count, such as the errors of the panel. */
export function Tab({ className, ...props }: TabProps) {
    return <AriaTab {...props} className={cx(styles.tab, className)} />;
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className' | 'style'> {
    className?: string;
}

/**
 * The content of a tab. With `shouldForceMount`, the panel stays mounted (and hidden) when another
 * tab is selected, which keeps the state of its fields.
 */
export function TabPanel({ className, ...props }: TabPanelProps) {
    return <AriaTabPanel {...props} className={cx(styles.panel, className)} />;
}
