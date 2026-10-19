import type { ReactNode } from 'react';

import { cx } from '../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps {
    tone?: BadgeTone;
    children?: ReactNode;
    /**
     * Accessible text, when the visible content isn't enough on its own (a count of errors: "2
     * errors"). The visible content is then hidden from assistive technologies.
     */
    label?: string;
    className?: string;
}

/** A short status or a count. */
export function Badge({ tone = 'neutral', children, label, className }: BadgeProps) {
    return (
        <span data-panneau="badge" className={cx(styles.badge, styles[tone], className)}>
            {label !== undefined ? (
                <>
                    <span aria-hidden="true">{children}</span>
                    <span className={styles.visuallyHidden}>{label}</span>
                </>
            ) : (
                children
            )}
        </span>
    );
}
