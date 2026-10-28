import type { CSSProperties, ReactNode } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { cx } from '../utils/cx';
import styles from './Skeleton.module.css';

export interface LoadingRegionProps {
    /** The skeleton of the content that loads. */
    children?: ReactNode;
    /** The status message read by screen readers. Defaults to "Loading…". */
    label?: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * The region of content that loads, around its skeleton (decision 0034): it has
 * `aria-busy="true"`, and says once that the content loads, with a status message that screen
 * readers read and that isn't shown. Render it in place of the content while it loads.
 */
export function LoadingRegion({ children, label, className, style }: LoadingRegionProps) {
    const intl = usePanneauIntl();
    return (
        <>
            <span role="status" className={styles.status}>
                {label ?? intl.formatMessage(messages.loading)}
            </span>
            <div aria-busy="true" className={cx('panneau-loading-region', className)} style={style}>
                {children}
            </div>
        </>
    );
}
