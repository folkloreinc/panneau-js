import { type RefObject, useEffect, useRef } from 'react';

import { useFormSelector } from '@panneau/core';
import { Form, useFormContext, useLeaveConfirmation } from '@panneau/forms';
import { getActionLabel } from '@panneau/intl';
import type { Action } from '@panneau/protocol';
import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

import styles from './ActionRunner.module.css';
import { messages } from './messages';
import type { ActionOutcome } from './types';

export interface ParametersDialogProps {
    action: Action;
    /** How many items the action applies to, for the confirm label. */
    count?: number | undefined;
    locales?: readonly string[] | undefined;
    /** Runs the action with the values. A validation error (`422`) shows on the fields. */
    onSubmit: (values: Record<string, unknown>) => Promise<ActionOutcome>;
    onDone: (outcome: ActionOutcome) => void;
    onCancel: () => void;
}

/**
 * Cancel, inside the form: with changed values, it asks first, as leaving a form page does. The
 * dialog asks it to close (Escape, a click outside) through `closeRef`.
 */
function CancelButton({
    closeRef,
    onCancel,
}: {
    closeRef: RefObject<(() => void) | null>;
    onCancel: () => void;
}) {
    const intl = usePanneauIntl();
    const form = useFormContext();
    const dirty = useFormSelector(form, (state) => state.dirty);
    const leave = useLeaveConfirmation(dirty);
    const request = () => {
        void leave.confirmLeave().then((confirmed) => {
            if (confirmed) {
                onCancel();
            }
        });
    };
    useEffect(() => {
        closeRef.current = request;
    });
    return (
        <>
            <Button onPress={request}>{intl.formatMessage(messages.cancel)}</Button>
            {leave.dialog}
        </>
    );
}

/**
 * The parameters of an action (`fields`, in its `layout`), in a dialog, with the client validation
 * of forms. The action runs when the form is submitted; errors of the action endpoint (`422`, keyed
 * by paths inside `values`) show on the fields, and other errors in the form.
 *
 * Closing the dialog with changed values (Escape, a click outside, Cancel) asks first, as leaving
 * a form page does.
 */
export function ParametersDialog({
    action,
    locales,
    onSubmit,
    onDone,
    onCancel,
}: ParametersDialogProps) {
    const intl = usePanneauIntl();
    const close = useRef<(() => void) | null>(null);
    const confirmLabel =
        typeof action.confirm === 'object' && action.confirm.confirmLabel !== undefined
            ? action.confirm.confirmLabel
            : getActionLabel(action, intl);
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    (close.current ?? onCancel)();
                }
            }}
            title={getActionLabel(action, intl)}
            size="md"
        >
            <Form
                fields={action.fields ?? []}
                layout={action.layout ?? []}
                {...(locales !== undefined ? { locales } : {})}
                aria-label={getActionLabel(action, intl)}
                submitLabel={confirmLabel}
                actions={<CancelButton closeRef={close} onCancel={onCancel} />}
                onSubmit={(values) => onSubmit(values)}
                onSubmitted={(outcome) => onDone(outcome as ActionOutcome)}
                showSavedToast={false}
                className={styles.parameters}
            />
        </Dialog>
    );
}
