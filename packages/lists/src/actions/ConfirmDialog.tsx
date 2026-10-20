import type { IntlShape } from 'react-intl';

import { Button, Dialog, Spinner, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { ListActionEvent, ListActionPreview } from '../types';
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

/** The dry run of a query selection: in progress, or done with the backend's count. */
export type ConfirmPreview = { status: 'loading' } | ({ status: 'done' } & ListActionPreview);

export interface ConfirmDialogProps {
    /** The action to confirm, or `null` when the dialog is closed. */
    event: ListActionEvent | null;
    /**
     * What the backend told about a query selection. Its count of skipped items replaces the
     * count of the current page; while it loads, the dialog says so and can't be confirmed.
     */
    preview?: ConfirmPreview | null;
    onConfirm: (event: ListActionEvent) => void;
    onCancel: () => void;
}

/**
 * Asks before running an action (decision 0017): the action's `confirm` title and message (an ICU
 * message with `{count}`), or default ones, and how many selected items will be skipped: those of
 * the current page that don't allow it, or the backend's count for every item matching a query.
 */
export function ConfirmDialog({ event, preview = null, onConfirm, onCancel }: ConfirmDialogProps) {
    const intl = usePanneauIntl();
    if (event === null) {
        return null;
    }
    const { action, count } = event;
    const loading = preview?.status === 'loading';
    const skipped = preview?.status === 'done' ? preview.skipped : event.skipped.length;
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
                        isDisabled={loading}
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
            {loading ? (
                <div className={styles.skipped}>
                    <Spinner
                        size="sm"
                        label={intl.formatMessage(messages.confirmChecking)}
                        showLabel
                    />
                </div>
            ) : skipped > 0 ? (
                <p className={styles.skipped}>
                    {intl.formatMessage(messages.confirmSkipped, { count: skipped })}
                </p>
            ) : null}
        </Dialog>
    );
}
