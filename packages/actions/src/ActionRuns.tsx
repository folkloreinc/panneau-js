import { X } from 'lucide-react';
import { use } from 'react';
import { ProgressBar } from 'react-aria-components';

import type { ActionRun } from '@panneau/protocol';
import { Button, IconButton, usePanneauIntl } from '@panneau/ui';

import styles from './ActionRunner.module.css';
import { ActionRunnerContext } from './context';
import { messages } from './messages';
import { isFinished } from './request';

const STATUS_MESSAGES = {
    queued: messages.runQueued,
    running: messages.runRunning,
    succeeded: messages.runSucceeded,
    partial: messages.runPartial,
    failed: messages.runFailed,
    cancelled: messages.runCancelled,
} satisfies Record<ActionRun['status'], unknown>;

export interface ActionRunsProps {
    /** Accessible name of the list. Defaults to "Actions in progress". */
    'aria-label'?: string;
    className?: string;
}

/**
 * The queued runs that the closest `ActionRunnerProvider` follows: their status and progress, a
 * button to cancel those that haven't finished (when the adapter can), and one to dismiss those
 * that have. For a notification area. Renders nothing without runs.
 */
export function ActionRuns({ 'aria-label': ariaLabel, className }: ActionRunsProps) {
    const intl = usePanneauIntl();
    const context = use(ActionRunnerContext);
    if (context === null || context.runs.length === 0) {
        return null;
    }
    const canCancel = context.adapter.cancelActionRun !== undefined;
    return (
        <ul
            aria-label={ariaLabel ?? intl.formatMessage(messages.runs)}
            className={[styles.runs, className].filter(Boolean).join(' ')}
        >
            {context.runs.map(({ run, target }) => {
                const label = target.action.label;
                const finished = isFinished(run.status);
                const status = intl.formatMessage(STATUS_MESSAGES[run.status]);
                return (
                    <li key={run.id} className={styles.run}>
                        <span className={styles.runLabel}>{label}</span>
                        {finished ? (
                            <IconButton
                                icon={X}
                                size="sm"
                                label={intl.formatMessage(messages.dismissRun, { action: label })}
                                onPress={() => context.dismissRun(run.id)}
                            />
                        ) : canCancel ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                aria-label={intl.formatMessage(messages.cancelRun, {
                                    action: label,
                                })}
                                onPress={() => {
                                    context.cancelRun(run.id).catch(() => undefined);
                                }}
                            >
                                {intl.formatMessage(messages.cancel)}
                            </Button>
                        ) : (
                            <span />
                        )}
                        {finished ? (
                            <span className={styles.runStatus}>{status}</span>
                        ) : (
                            <ProgressBar
                                aria-label={label}
                                className={styles.progress}
                                value={run.progress}
                                maxValue={run.total ?? undefined}
                                isIndeterminate={run.total === null || run.total === 0}
                                valueLabel={
                                    run.total !== null && run.total > 0
                                        ? intl.formatMessage(messages.progress, {
                                              progress: run.progress,
                                              total: run.total,
                                          })
                                        : status
                                }
                            >
                                {({ percentage, valueText }) => (
                                    <>
                                        <span className={styles.runStatus}>{valueText}</span>
                                        <span className={styles.track}>
                                            <span
                                                className={styles.fill}
                                                style={{ width: `${percentage ?? 100}%` }}
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
