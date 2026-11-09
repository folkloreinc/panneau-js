import { CircleCheck } from 'lucide-react';
import { type ReactNode, createContext } from 'react';

import type { Field } from '@panneau/protocol';
import { Button, Icon, Tooltip, isApplePlatform, usePanneauIntl } from '@panneau/ui';

import styles from '../Form.module.css';
import { cx } from '../cx';
import { messages } from '../messages';

export interface SaveState {
    /** What the status says: the failure of the last save, unsaved changes, or "Saved". */
    status: 'error' | 'unsaved' | 'saved' | null;
    isSubmitting: boolean;
    /** The form's `actions`, next to its button. */
    actions: ReactNode;
    /** The label of the submit button, or `null` without one. */
    submitLabel: ReactNode;
}

export interface SummaryState {
    /** Errors by path, in the order of their fields, after a failed save. Empty otherwise. */
    errors: Record<string, string[]>;
    fields: readonly Field[];
    onSelect: (path: string) => void;
}

/** What the `save` panel shows, from its `FormView` (decision 0075). */
export const SaveContext = createContext<SaveState | null>(null);

/** What the `errors` panel shows, from its `FormView` (decision 0075). */
export const SummaryContext = createContext<SummaryState | null>(null);

/**
 * The status of a form, its actions and its Save button: in its footer, or in the `save` panel of
 * its sidebar.
 */
export function SaveControls({ status, isSubmitting, actions, submitLabel }: SaveState) {
    const intl = usePanneauIntl();
    const apple = isApplePlatform();
    return (
        <>
            <span
                className={cx(styles.status, status === 'error' && styles.statusError)}
                role="status"
            >
                {status === 'error' ? (
                    intl.formatMessage(messages.saveFailed)
                ) : status === 'unsaved' ? (
                    intl.formatMessage(messages.unsaved)
                ) : status === 'saved' ? (
                    <>
                        <Icon icon={CircleCheck} />
                        {intl.formatMessage(messages.saved)}
                    </>
                ) : null}
            </span>
            {actions}
            {submitLabel !== null ? (
                <Tooltip
                    content={intl.formatMessage(messages.saveShortcut, {
                        modifier: apple ? '⌘' : 'Ctrl',
                    })}
                >
                    <Button
                        type="submit"
                        variant="primary"
                        isPending={isSubmitting}
                        aria-keyshortcuts={apple ? 'Meta+Enter' : 'Control+Enter'}
                    >
                        {submitLabel ?? intl.formatMessage(messages.save)}
                    </Button>
                </Tooltip>
            ) : null}
        </>
    );
}
