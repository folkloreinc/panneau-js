import type { HTMLAttributes } from 'react';

import { cx } from '../utils/cx';
import styles from './Divider.module.css';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
    /** `vertical` separates items of a row. Defaults to `horizontal`. */
    orientation?: 'horizontal' | 'vertical';
}

/** A line between groups of content: an `hr`, or a vertical separator in a row. */
export function Divider({ orientation = 'horizontal', className, ...props }: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div
                role="separator"
                aria-orientation="vertical"
                {...props}
                className={cx('panneau-divider', styles.divider, styles.vertical, className)}
            />
        );
    }
    return <hr {...props} className={cx('panneau-divider', styles.divider, className)} />;
}
