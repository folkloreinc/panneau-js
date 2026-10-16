import type { ActionResult } from '@panneau/protocol';
import { Badge, Button, Dialog, usePanneauIntl } from '@panneau/ui';

import styles from './ActionRunner.module.css';
import { describeItemResult, describeResult } from './describe';
import { messages } from './messages';

export interface ResultsDialogProps {
    /** The label of the action. */
    label: string;
    result: ActionResult;
    onClose: () => void;
}

/** The items of a result that didn't succeed, with why: failed with a message, or skipped. */
export function ResultsDialog({ label, result, onClose }: ResultsDialogProps) {
    const intl = usePanneauIntl();
    const summary = describeResult(result, label, intl);
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title={intl.formatMessage(messages.resultsTitle, { action: label })}
            footer={
                <Button variant="secondary" onPress={onClose}>
                    {intl.formatMessage(messages.close)}
                </Button>
            }
        >
            <p className={styles.summary}>
                {summary.title}
                {summary.description !== undefined ? ` ${summary.description}` : null}
            </p>
            <ul className={styles.results}>
                {(result.results ?? []).map((entry) => (
                    <li key={entry.id} className={styles.result}>
                        <span className={styles.resultItem}>
                            {intl.formatMessage(messages.item, { id: entry.id })}
                        </span>
                        <Badge tone={entry.status === 'failed' ? 'danger' : 'neutral'}>
                            {intl.formatMessage(
                                entry.status === 'failed'
                                    ? messages.statusFailed
                                    : messages.statusSkipped,
                            )}
                        </Badge>
                        <span className={styles.resultReason}>
                            {describeItemResult(entry, intl)}
                        </span>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}
