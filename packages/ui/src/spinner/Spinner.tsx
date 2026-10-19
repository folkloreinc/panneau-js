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
            <span className={styles.circle} aria-hidden="true" />
            {showLabel ? <span>{text}</span> : null}
        </ProgressBar>
    );
}
