import type { IntlShape } from 'react-intl';

import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListActionEvent } from '../types';
import styles from './Actions.module.css';

/** Formats an ICU message of the definition (`{count, plural, …}`) in the locale. */
function formatDefinitionMessage(
    intl: IntlShape,
    message: string,
    values: Record<string, unknown>,
) {
    try {
        return String(
            intl.formatters
                .getMessageFormat(message, intl.locale)
                .format(values as Record<string, string | number>),
        );
    } catch {
        return message;
    }
}

/** Whether an action needs a confirmation: it asks for one, or some selected items are skipped. */
export function needsConfirmation(event: ListActionEvent): boolean {
    const { confirm } = event.action;
    return (confirm !== undefined && confirm !== false) || event.skipped.length > 0;
}

export interface ConfirmDialogProps {
    /** The action to confirm, or `null` when the dialog is closed. */
    event: ListActionEvent | null;
    onConfirm: (event: ListActionEvent) => void;
    onCancel: () => void;
}

/**
 * Asks before running an action (decision 0017): the action's `confirm` title and message (an ICU
 * message with `{count}`), or default ones, and how many selected items will be skipped.
 */
export function ConfirmDialog({ event, onConfirm, onCancel }: ConfirmDialogProps) {
    const intl = usePanneauIntl();
    if (event === null) {
        return null;
    }
    const { action, count, skipped } = event;
    const confirm = typeof action.confirm === 'object' ? action.confirm : {};
    const values = { count, action: action.label };
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            role="alertdialog"
            isDismissable={false}
            size="sm"
            title={
                confirm.title !== undefined
                    ? formatDefinitionMessage(intl, confirm.title, values)
                    : intl.formatMessage(messages.confirmTitle, { action: action.label })
            }
            footer={
                <>
                    <Button variant="ghost" onPress={onCancel}>
                        {confirm.cancelLabel ?? intl.formatMessage(messages.cancel)}
                    </Button>
                    <Button
                        variant={action.destructive === true ? 'danger' : 'primary'}
                        autoFocus
                        onPress={() => onConfirm(event)}
                    >
                        {confirm.confirmLabel ?? action.label}
                    </Button>
                </>
            }
        >
            <p className={styles.message}>
                {confirm.message !== undefined
                    ? formatDefinitionMessage(intl, confirm.message, values)
                    : intl.formatMessage(messages.confirmMessage, values)}
            </p>
            {skipped.length > 0 ? (
                <p className={styles.skipped}>
                    {intl.formatMessage(messages.confirmSkipped, { count: skipped.length })}
                </p>
            ) : null}
        </Dialog>
    );
}
