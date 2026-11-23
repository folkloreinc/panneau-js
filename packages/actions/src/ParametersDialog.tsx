import { useLayoutEffect, useState } from 'react';

import {
    type FormOptions,
    createForm,
    resolveFields,
    useFormSelector,
    usePanneau,
} from '@panneau/core';
import { FormView, useFormatRuleFailure, useLeaveConfirmation } from '@panneau/forms';
import { getActionLabel } from '@panneau/intl';
import type { Action, LayoutNode } from '@panneau/protocol';
import { Button, Dialog, usePanneauIntl } from '@panneau/ui';

import styles from './ActionRunner.module.css';
import { messages } from './messages';
import type { ActionOutcome } from './types';

// Not `[]` in the component: the React Compiler doesn't memoize what is computed from an array
// made before a hook
const NO_FIELDS: NonNullable<Action['fields']> = [];
const NO_LAYOUT: readonly LayoutNode[] = [];
const NO_LOCALES: readonly string[] = [];

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
    const { definition } = usePanneau();
    const fields = action.fields ?? NO_FIELDS;
    const layout = action.layout ?? NO_LAYOUT;
    // As `Form` does, with the form at hand: closing reads whether it has changed
    const resolved = resolveFields(fields, layout, { mode: 'create' });
    const formatRuleFailure = useFormatRuleFailure(resolved.fields);
    const formLocales = locales ?? definition?.locales ?? NO_LOCALES;
    const options: FormOptions = {
        fields: resolved.fields,
        locales: [...formLocales],
        formatError: formatRuleFailure,
        mode: 'create',
        onSubmit: (values) => onSubmit(values),
    };
    const [form] = useState(() => createForm(options));
    useLayoutEffect(() => {
        form.setOptions({
            fields: options.fields,
            locales: options.locales,
            formatError: options.formatError,
            onSubmit: options.onSubmit,
        });
    });
    const dirty = useFormSelector(form, (state) => state.dirty);
    const leave = useLeaveConfirmation(dirty);
    const close = () => {
        void leave.confirmLeave().then((confirmed) => {
            if (confirmed) {
                onCancel();
            }
        });
    };

    const confirmLabel =
        typeof action.confirm === 'object' && action.confirm.confirmLabel !== undefined
            ? action.confirm.confirmLabel
            : getActionLabel(action, intl);
    return (
        <>
            <Dialog
                isOpen
                onOpenChange={(open) => {
                    if (!open) {
                        close();
                    }
                }}
                title={getActionLabel(action, intl)}
                size="md"
            >
                <FormView
                    form={form}
                    fields={resolved.fields}
                    layout={layout}
                    locales={formLocales}
                    aria-label={getActionLabel(action, intl)}
                    submitLabel={confirmLabel}
                    actions={<Button onPress={close}>{intl.formatMessage(messages.cancel)}</Button>}
                    onSubmitted={(outcome) => onDone(outcome as ActionOutcome)}
                    showSavedToast={false}
                    className={styles.parameters}
                />
            </Dialog>
            {leave.dialog}
        </>
    );
}
