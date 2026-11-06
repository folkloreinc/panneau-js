import { ProgressBar } from 'react-aria-components';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { cx } from '../utils/cx';
import styles from './Spinner.module.css';

export interface SpinnerProps {
    /** Accessible label, and visible text with `showLabel`. Defaults to "Loading…". */
    label?: string;
    /** Shows the label next to the spinner. */
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/** An indeterminate progress indicator, announced as loading. */
export function Spinner({ label, showLabel = false, size = 'md', className }: SpinnerProps) {
    const intl = usePanneauIntl();
    const text = label ?? intl.formatMessage(messages.loading);
    return (
        <ProgressBar
            isIndeterminate
            aria-label={text}
            className={cx('panneau-spinner', styles.spinner, styles[size], className)}
        >
            {/* A faint ring, and an arc with rounded ends that turns on it. */}
            <svg className={styles.circle} viewBox="0 0 24 24" aria-hidden="true">
                <circle className={styles.track} cx="12" cy="12" r="10.5" />
                <path className={styles.arc} d="M12 1.5a10.5 10.5 0 0 1 10.5 10.5" />
            </svg>
            {showLabel ? <span>{text}</span> : null}
        </ProgressBar>
    );
}
