import { Form } from '@panneau/forms';
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
 * The parameters of an action (`fields`, in its `layout`), in a dialog, with the client validation
 * of forms. The action runs when the form is submitted; errors of the action endpoint (`422`, keyed
 * by paths inside `values`) show on the fields, and other errors in the form.
 */
export function ParametersDialog({
    action,
    locales,
    onSubmit,
    onDone,
    onCancel,
}: ParametersDialogProps) {
    const intl = usePanneauIntl();
    const confirmLabel =
        typeof action.confirm === 'object' && action.confirm.confirmLabel !== undefined
            ? action.confirm.confirmLabel
            : action.label;
    return (
        <Dialog
            isOpen
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            title={action.label}
            size="md"
        >
            <Form
                fields={action.fields ?? []}
                layout={action.layout ?? []}
                {...(locales !== undefined ? { locales } : {})}
                aria-label={action.label}
                submitLabel={confirmLabel}
                actions={
                    <Button variant="secondary" onPress={onCancel}>
                        {intl.formatMessage(messages.cancel)}
                    </Button>
                }
                onSubmit={(values) => onSubmit(values)}
                onSubmitted={(outcome) => onDone(outcome as ActionOutcome)}
                guardUnsavedChanges={false}
                showSavedToast={false}
                className={styles.parameters}
            />
        </Dialog>
    );
}
