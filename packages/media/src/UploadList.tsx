import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { ProgressBar } from 'react-aria-components';

import { IconButton, usePanneauIntl } from '@panneau/ui';

import styles from './UploadList.module.css';
import { cx } from './cx';
import { formatSize } from './files';
import { messages } from './messages';
import type { UploadItem } from './uploader';

export interface UploadListProps {
    /** The files being uploaded, from `useUploads()`. */
    items: readonly UploadItem[];
    onPause?: (id: string) => void;
    onResume?: (id: string) => void;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    /** Accessible name of the list. Defaults to "Uploads". */
    'aria-label'?: string;
    className?: string;
}

/**
 * The files being uploaded: a progress bar for each, and buttons to pause and resume a file sent
 * in parts, to cancel it, and to retry it when it failed. Renders nothing without files.
 */
export function UploadList({
    items,
    onPause,
    onResume,
    onCancel,
    onRetry,
    'aria-label': ariaLabel,
    className,
}: UploadListProps) {
    const intl = usePanneauIntl();
    if (items.length === 0) {
        return null;
    }
    return (
        <ul
            className={cx(styles.list, className)}
            aria-label={ariaLabel ?? intl.formatMessage(messages.uploads)}
        >
            {items.map((item) => {
                const { name } = item;
                const failed = item.status === 'failed';
                const indeterminate = item.progress === null || item.status === 'completing';
                const status = {
                    uploading: intl.formatMessage(messages.uploading),
                    paused: intl.formatMessage(messages.paused),
                    completing: intl.formatMessage(messages.completing),
                    failed: intl.formatMessage(messages.failed, { error: item.error ?? '' }),
                }[item.status];
                const percent = item.progress === null ? null : Math.round(item.progress * 100);
                return (
                    <li key={item.id} className={cx(styles.item, failed && styles.failed)}>
                        <span className={styles.name}>
                            {name}
                            {item.size !== null ? ` · ${formatSize(item.size, intl.locale)}` : null}
                        </span>
                        <span className={styles.buttons}>
                            {item.canPause && item.status === 'uploading' && onPause ? (
                                <IconButton
                                    icon={Pause}
                                    size="sm"
                                    label={intl.formatMessage(messages.pause, { name })}
                                    onPress={() => onPause(item.id)}
                                />
                            ) : null}
                            {item.status === 'paused' && onResume ? (
                                <IconButton
                                    icon={Play}
                                    size="sm"
                                    label={intl.formatMessage(messages.resume, { name })}
                                    onPress={() => onResume(item.id)}
                                />
                            ) : null}
                            {failed && onRetry ? (
                                <IconButton
                                    icon={RotateCcw}
                                    size="sm"
                                    label={intl.formatMessage(messages.retry, { name })}
                                    onPress={() => onRetry(item.id)}
                                />
                            ) : null}
                            {item.status !== 'completing' && onCancel ? (
                                <IconButton
                                    icon={X}
                                    size="sm"
                                    label={intl.formatMessage(messages.cancel, { name })}
                                    onPress={() => onCancel(item.id)}
                                />
                            ) : null}
                        </span>
                        {failed ? (
                            <span className={styles.error} role="alert">
                                {status}
                            </span>
                        ) : (
                            <ProgressBar
                                aria-label={name}
                                className={cx(
                                    styles.progress,
                                    indeterminate && styles.indeterminate,
                                )}
                                value={percent ?? 0}
                                isIndeterminate={indeterminate}
                                valueLabel={
                                    item.progress !== null && !indeterminate
                                        ? `${status} · ${intl.formatNumber(item.progress, { style: 'percent' })}`
                                        : status
                                }
                            >
                                {({ valueText }) => (
                                    <>
                                        <span className={styles.status}>{valueText}</span>
                                        <span className={styles.track}>
                                            <span
                                                className={styles.fill}
                                                style={
                                                    indeterminate
                                                        ? undefined
                                                        : { width: `${String(percent ?? 0)}%` }
                                                }
                                            />
                                        </span>
                                    </>
                                )}
                            </ProgressBar>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
