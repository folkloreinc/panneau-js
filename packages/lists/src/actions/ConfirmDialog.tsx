import type { IntlShape } from 'react-intl';

import { asksConfirmation } from '@panneau/core';
import { actionsMessages, getActionLabel } from '@panneau/intl';
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

/**
 * Whether an action needs a confirmation: it asks for one, or it is undoable but runs on more items
 * than an undo can put back (`asksConfirmation()`, decision 0063), or some selected items are
 * skipped.
 */
export function needsConfirmation(event: ListActionEvent): boolean {
    return asksConfirmation(event.action, event.count) || event.skipped.length > 0;
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
    /**
     * The label of the item of an `item` action (its title), to name it: "Delete “Spring
     * contest”?". Without it, the dialog counts items.
     */
    itemLabel?: string | undefined;
    /**
     * The labels of the items' resource, to name what a selection holds: "Delete 3 articles?".
     * Without them, the dialog counts items.
     */
    labels?: { readonly singular: string; readonly plural: string } | undefined;
    onConfirm: (event: ListActionEvent) => void;
    onCancel: () => void;
}

/**
 * What an action applies to, for its confirmation (decision 0062): the item by its title, or the
 * count of items with the resource's labels. `null` when there is nothing to name it by.
 */
function describeSubject(
    event: ListActionEvent,
    itemLabel: string | undefined,
    labels: ConfirmDialogProps['labels'],
    intl: IntlShape,
): string | null {
    if (event.scope === 'item' || event.item !== undefined) {
        return itemLabel !== undefined && itemLabel !== ''
            ? intl.formatMessage(actionsMessages.subjectItem, { title: itemLabel })
            : null;
    }
    return labels !== undefined
        ? intl.formatMessage(actionsMessages.subjectCount, {
              count: event.count,
              singular: labels.singular,
              plural: labels.plural,
          })
        : null;
}

/**
 * Asks before running an action (decision 0017): the action's `confirm` title and message (an ICU
 * message with `{count}`), or default ones that name the item (`itemLabel`) or the items of a
 * selection (`labels`), and how many selected items will be skipped: those of the current page that
 * don't allow it, or the backend's count for every item matching a query.
 * It opens with the focus on "Cancel" for a destructive action, and on the confirming button
 * otherwise (decision 0095).
 */
export function ConfirmDialog({
    event,
    preview = null,
    itemLabel,
    labels,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const intl = usePanneauIntl();
    if (event === null) {
        return null;
    }
    const { action, count } = event;
    const loading = preview?.status === 'loading';
    const destructive = action.destructive === true;
    const skipped = preview?.status === 'done' ? preview.skipped : event.skipped.length;
    const confirm = typeof action.confirm === 'object' ? action.confirm : {};
    const label = getActionLabel(action, intl);
    const values = { count, action: label };
    const subject = describeSubject(event, itemLabel, labels, intl);
    // The built-in `delete` says what it deletes in its title, which needs no message under it
    const isBuiltInDelete = action.id === 'delete' && action.label === undefined;
    const title =
        confirm.title !== undefined
            ? formatDefinitionMessage(intl, confirm.title, values)
            : subject !== null && isBuiltInDelete
              ? intl.formatMessage(messages.confirmDeleteTitle, { subject })
              : intl.formatMessage(messages.confirmTitle, { action: label });
    const message =
        confirm.message !== undefined
            ? formatDefinitionMessage(intl, confirm.message, values)
            : subject === null
              ? intl.formatMessage(messages.confirmMessage, values)
              : confirm.title === undefined && isBuiltInDelete
                ? null
                : intl.formatMessage(messages.confirmMessageFor, { action: label, subject });
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
            title={title}
            footer={
                <>
                    {/* The safe choice has the focus when the action destroys (decision 0095) */}
                    <Button appearance="ghost" autoFocus={destructive} onPress={onCancel}>
                        {confirm.cancelLabel ?? intl.formatMessage(messages.cancel)}
                    </Button>
                    {/* Pending while the dry run counts: it keeps the focus, and ignores presses */}
                    <Button
                        tone={destructive ? 'danger' : 'accent'}
                        autoFocus={!destructive}
                        isPending={loading}
                        onPress={() => onConfirm(event)}
                    >
                        {confirm.confirmLabel ?? label}
                    </Button>
                </>
            }
        >
            {message !== null ? <p className={styles.message}>{message}</p> : null}
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
