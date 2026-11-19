import type { ReactNode } from 'react';

import type { HeadingLevel } from '../heading/Heading';
import { Icon, type IconComponent } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
    /** An icon, in a rounded square. */
    icon?: IconComponent | undefined;
    /** What is missing: "No items yet." */
    title: ReactNode;
    /** What it means, or what to do. */
    description?: ReactNode;
    /** Buttons or links that fill the region: "Create an item", "Clear filters". */
    actions?: ReactNode;
    /** `md` (default) for a list or a page, `sm` for a widget, a popover or a panel. */
    size?: 'sm' | 'md';
    /** Makes the title a heading of this level, for a page that is empty as a whole. */
    headingLevel?: HeadingLevel | undefined;
    className?: string | undefined;
}

/**
 * What a region shows when it has nothing to show: an icon, a title, a description, and actions.
 * Never while its content loads: a skeleton is shown then.
 */
export function EmptyState({
    icon,
    title,
    description,
    actions,
    size = 'md',
    headingLevel,
    className,
}: EmptyStateProps) {
    const Title = headingLevel !== undefined ? (`h${headingLevel}` as const) : 'p';
    return (
        <div className={cx('panneau-empty-state', styles.emptyState, styles[size], className)}>
            {icon !== undefined ? (
                <span className={styles.icon}>
                    <Icon icon={icon} size={size === 'sm' ? 'md' : 'lg'} />
                </span>
            ) : null}
            <div className={styles.text}>
                <Title className={styles.title}>{title}</Title>
                {description !== undefined && description !== null ? (
                    <div className={styles.description}>{description}</div>
                ) : null}
            </div>
            {actions !== undefined && actions !== null ? (
                <div className={styles.actions}>{actions}</div>
            ) : null}
        </div>
    );
}
